import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in-up">
            <div className="card-nmims max-w-lg w-full p-10 text-center relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-destructive/10 blur-3xl rounded-full"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 border border-destructive/20 shadow-sm animate-pulse">
                        <ShieldAlert className="w-10 h-10" />
                    </div>

                    <h1 className="text-3xl font-bold text-foreground mb-3">Access Denied</h1>
                    <p className="text-muted-foreground mb-8 text-sm max-w-sm">
                        You do not have the required administrative privileges to view this area. If you believe this is an error, please contact IT support.
                    </p>

                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="btn-nmims-primary w-full sm:w-auto"
                    >
                        Return to Student Portal
                    </button>
                </div>
            </div>
        </div>
    );
};
