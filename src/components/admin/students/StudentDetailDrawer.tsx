import React, { useEffect } from 'react';
import { X, Mail, Phone, BookOpen, Briefcase, Award, TrendingUp, Download, Building2 } from 'lucide-react';
import type { AdminStudentProfile } from '../../../types/studentAdmin';

interface StudentDetailDrawerProps {
    student: AdminStudentProfile | null;
    isOpen: boolean;
    onClose: () => void;
}

export const StudentDetailDrawer: React.FC<StudentDetailDrawerProps> = ({
    student,
    isOpen,
    onClose
}) => {

    // Handle Escape key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !student) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 overflow-y-auto animate-slide-in-right">

                {/* Header Section */}
                <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/20 flex items-center justify-center shadow-inner">
                            <span className="text-2xl font-bold text-brand-300">
                                {student.fullName.charAt(0)}{student.fullName.split(' ')[1]?.[0] || ''}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{student.fullName}</h2>
                            <p className="text-slate-400 font-mono mt-1">{student.sapId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-8 pb-32">

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                            <div className="text-sm text-slate-400 mb-1">CGPA</div>
                            <div className="text-xl font-bold text-brand-400">{student.cgpa.toFixed(2)}</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                            <div className="text-sm text-slate-400 mb-1">Readiness</div>
                            <div className="text-xl font-bold text-white">{student.readinessScore}%</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                            <div className="text-sm text-slate-400 mb-1">Projects</div>
                            <div className="text-xl font-bold text-white">{student.projectsCount || 0}</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                            <div className="text-sm text-slate-400 mb-1">Offers</div>
                            <div className="text-xl font-bold text-emerald-400">{student.offersCount || 0}</div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Contact & Basics</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Mail className="w-4 h-4 text-slate-500" />
                                <a href={`mailto:${student.email}`} className="hover:text-brand-400 transition-colors">{student.email}</a>
                            </div>
                            {student.contact && (
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                    <span>{student.contact}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-slate-400">
                                <Building2 className="w-4 h-4 text-slate-500" />
                                <span>{student.department} • {student.currentYear}</span>
                            </div>
                        </div>
                    </div>

                    {/* Readiness Gauge & Goal */}
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-brand-400" />
                            Placement Readiness
                        </h3>

                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-slate-400 text-sm">Overall Score</span>
                                <span className="text-2xl font-bold text-white">{student.readinessScore}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${student.readinessScore >= 75 ? 'bg-emerald-500' :
                                            student.readinessScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}
                                    style={{ width: `${student.readinessScore}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-xs text-slate-500 mb-1">Career Goal</span>
                                <span className="inline-block px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300">
                                    {student.careerGoal}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 mb-1">Mandatory Internship</span>
                                <span className={`inline-block px-3 py-1 rounded-lg text-sm border ${student.internshipCompleted
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    }`}>
                                    {student.internshipCompleted ? 'Completed' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Resume & Documents */}
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-slate-400" />
                                Master Resume
                            </h3>
                            <p className="text-sm text-slate-500">Status: <span className="capitalize">{student.resumeStatus}</span></p>
                        </div>
                        <button
                            disabled={student.resumeStatus === 'not_uploaded'}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600 rounded-lg text-sm font-medium text-white transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>

                    {/* Skills & Certifications */}
                    <div className="space-y-6">
                        {student.skills && student.skills.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    Technical Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {student.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full text-sm text-slate-300">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {student.certifications && student.certifications.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-slate-400" />
                                    Certifications
                                </h3>
                                <ul className="space-y-2">
                                    {student.certifications.map(cert => (
                                        <li key={cert} className="flex items-start gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                                            <Award className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-300">{cert}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
