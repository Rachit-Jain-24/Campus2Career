import { useState } from 'react';
import { createAdminAccount } from '../utils/createAdminAccount';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function CreateAdminPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreateAdmin = async () => {
        setIsCreating(true);
        setError(null);
        setResult(null);

        try {
            const res = await createAdminAccount();
            setResult(res);
        } catch (err: any) {
            setError(err.message || 'Failed to create admin account');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create Admin Account
                    </h1>
                    <p className="text-gray-600">
                        Set up a system administrator account to access the admin panel
                    </p>
                </div>

                {!result && !error && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <h3 className="font-semibold text-gray-900 mb-2">Default Credentials:</h3>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p><span className="font-medium">Email:</span> admin@nmims.edu.in</p>
                                <p><span className="font-medium">Password:</span> admin123</p>
                                <p><span className="font-medium">Role:</span> System Admin</p>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateAdmin}
                            disabled={isCreating}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Admin Account...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Create Admin Account
                                </>
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                            If the account already exists, it will be updated
                        </p>
                    </div>
                )}

                {result && (
                    <div className="space-y-4">
                        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <h3 className="text-xl font-bold text-green-900">
                                    Admin Account Created!
                                </h3>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="bg-white p-4 rounded border border-green-200">
                                    <p className="text-sm text-gray-600 mb-1">Email</p>
                                    <p className="font-mono font-semibold text-gray-900">{result.email}</p>
                                </div>
                                
                                <div className="bg-white p-4 rounded border border-green-200">
                                    <p className="text-sm text-gray-600 mb-1">Password</p>
                                    <p className="font-mono font-semibold text-gray-900">{result.password}</p>
                                </div>
                            </div>
                        </div>

                        <a
                            href="/login/admin"
                            className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center"
                        >
                            Go to Admin Login →
                        </a>

                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                            <p className="text-sm text-yellow-800">
                                <strong>Important:</strong> Change the default password after your first login for security.
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="space-y-4">
                        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                                <h3 className="text-xl font-bold text-red-900">
                                    Error Creating Account
                                </h3>
                            </div>
                            <p className="text-red-700">{error}</p>
                        </div>

                        <button
                            onClick={handleCreateAdmin}
                            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
