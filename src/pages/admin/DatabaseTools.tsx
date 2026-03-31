import React from 'react';
import { Database, ArrowLeft, Search, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DuplicateCleanupTool } from '../../components/admin/tools/DuplicateCleanupTool';
import { StudentDataFixTool } from '../../components/admin/tools/StudentDataFixTool';

export const DatabaseTools: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin')}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Database className="h-8 w-8 text-primary" />
                        Database Tools
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and maintain your database
                    </p>
                </div>
            </div>

            {/* Comprehensive Fix Tools */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Wrench className="h-6 w-6 text-blue-600" />
                    Comprehensive Student Data Fix
                </h2>
                <p className="text-gray-600 mb-4">
                    All-in-one solution: Remove duplicates, fix missing data, and create auth accounts
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/admin/preview-fixes')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-foreground rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        <Search className="h-5 w-5" />
                        Preview Changes
                    </button>
                    <button
                        onClick={() => navigate('/admin/fix-student-data')}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-foreground rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                        <Wrench className="h-5 w-5" />
                        Apply Fixes
                    </button>
                </div>
            </div>

            {/* Legacy Tools */}
            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-700">Legacy Tools</h2>
                <StudentDataFixTool />
                <DuplicateCleanupTool />
            </div>
        </div>
    );
};
