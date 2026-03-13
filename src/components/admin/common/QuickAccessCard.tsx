import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, ArrowRight } from 'lucide-react';

export const DatabaseToolsQuickAccess: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                    <Database className="h-6 w-6" />
                </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Database Tools</h3>
            <p className="text-sm opacity-90 mb-4">
                Clean duplicate entries and maintain database integrity
            </p>
            <button
                onClick={() => navigate('/admin/database-tools')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
                Open Tools
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    );
};
