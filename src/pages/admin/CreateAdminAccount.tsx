import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function CreateAdminAccount() {
    const [email, setEmail] = useState('admin@nmims.edu.in');
    const [password, setPassword] = useState('Admin@123');
    const [name, setName] = useState('Admin User');
    const [isCreating, setIsCreating] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setResult(null);

        try {
            // Step 1: Create Firebase Auth account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // Step 2: Create Firestore document in 'admins' collection
            await setDoc(doc(db, 'admins', email), {
                id: email, // Changed to readable email for ID
                uid: uid,
                email: email,
                name: name,
                role: 'system_admin',
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            setResult({
                success: true,
                message: `Admin account created successfully! You can now login at /admin/login with email: ${email}`
            });

            // Clear form
            setEmail('');
            setPassword('');
            setName('');
        } catch (error: any) {
            let errorMessage = 'Failed to create admin account.';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Try logging in or use a different email.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else {
                errorMessage = error.message || errorMessage;
            }

            setResult({
                success: false,
                message: errorMessage
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-8 w-8 text-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Create Admin Account</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Create a system administrator account for Campus2Career
                        </p>
                    </div>

                    {/* Result Message */}
                    {result && (
                        <div className={`mb-6 p-4 rounded-xl border ${
                            result.success 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-start gap-3">
                                {result.success ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                )}
                                <p className={`text-sm ${
                                    result.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {result.message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Admin Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Admin User"
                                required
                                disabled={isCreating}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="admin@nmims.edu.in"
                                required
                                disabled={isCreating}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Min 6 characters"
                                required
                                disabled={isCreating}
                                minLength={6}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Minimum 6 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full bg-gradient-to-r from-primary to-blue-600 text-foreground font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <Shield className="h-5 w-5" />
                                    Create Admin Account
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-800">
                            <strong>Note:</strong> This will create a System Admin account with full access to all features.
                            After creation, you can login at <code className="bg-blue-100 px-1 py-0.5 rounded">/admin/login</code>
                        </p>
                    </div>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-2">
                        <a 
                            href="/admin/login" 
                            className="text-sm text-primary hover:underline block"
                        >
                            Already have an account? Login here
                        </a>
                        <a 
                            href="/" 
                            className="text-sm text-muted-foreground hover:text-slate-900 block"
                        >
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
