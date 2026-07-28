import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';

export const DuplicateCleanupTool: React.FC = () => {
    return (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    Database Status
                </h2>
                <p className="text-muted-foreground mt-1">
                    Supabase PostgreSQL with ACID compliance prevents duplicate entries
                </p>
            </div>

            {/* Status Message */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-green-900">Database Optimized</h3>
                        <p className="text-sm text-green-700 mt-1">
                            Using Supabase PostgreSQL with proper constraints and unique indexes. 
                            Duplicate prevention is handled at the database level.
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm mb-2">Why no cleanup needed:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>PostgreSQL enforces unique constraints on SAP ID and Email</li>
                            <li>Row Level Security (RLS) policies prevent unauthorized inserts</li>
                            <li>Database transactions ensure data consistency</li>
                            <li>Migrated from Firestore to proper relational schema</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
