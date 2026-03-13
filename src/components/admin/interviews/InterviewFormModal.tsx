import React, { useState, useEffect } from 'react';
import { X, CalendarClock, Loader2, Save, User, MapPin, Video, Users } from 'lucide-react';
import type { AdminInterview, InterviewFormData } from '../../../types/interviewAdmin';
import { useStudents } from '../../../hooks/admin/useStudents';
import { useCompanies } from '../../../hooks/admin/useCompanies';
import { useDrives } from '../../../hooks/admin/useDrives';

interface InterviewFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: InterviewFormData) => Promise<void>;
    initialData?: AdminInterview;
    isSaving: boolean;
}

const DEFAULT_FORM: InterviewFormData = {
    studentId: '',
    studentName: '',
    companyId: '',
    companyName: '',
    driveId: '',
    driveTitle: '',
    roundType: 'technical_interview',
    scheduledDate: new Date(),
    scheduledTime: '',
    mode: 'online',
    location: '',
    meetingLink: '',
    panelName: '',
    panelMembers: [],
    notes: '',
    status: 'scheduled',
    attendanceStatus: 'pending',
    resultStatus: 'pending'
};

export const InterviewFormModal: React.FC<InterviewFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    isSaving
}) => {
    const { students } = useStudents();
    const { companies } = useCompanies();
    const { drives } = useDrives();

    const [formData, setFormData] = useState<InterviewFormData>(DEFAULT_FORM);
    const [panelMembersText, setPanelMembersText] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
                setPanelMembersText(initialData.panelMembers?.join(', ') || '');
            } else {
                setFormData(DEFAULT_FORM);
                setPanelMembersText('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const studentId = e.target.value;
        const student = students.find(s => s.id === studentId);
        setFormData(prev => ({
            ...prev,
            studentId: student ? student.id : '',
            studentName: student ? student.fullName : ''
        }));
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        const company = companies.find(c => c.id === companyId);
        setFormData(prev => ({
            ...prev,
            companyId: company ? company.id : '',
            companyName: company ? company.companyName : ''
        }));
    };

    const handleDriveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const driveId = e.target.value;
        const drive = drives.find(d => d.id === driveId);
        setFormData(prev => ({
            ...prev,
            driveId: drive ? drive.id : '',
            driveTitle: drive ? drive.title : ''
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        if (dateStr) {
            // Need to set the date keeping the local timezone intent
            const dateObj = new Date(dateStr);
            setFormData(prev => ({ ...prev, scheduledDate: dateObj }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clean up text lists
        const membersList = panelMembersText
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        const payload: InterviewFormData = {
            ...formData,
            panelMembers: membersList
        };

        await onSave(payload);
    };

    const isEditMode = !!initialData;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-brand-500" />
                        {isEditMode ? 'Reschedule or Edit Interview' : 'Schedule New Interview'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/80">
                    <form id="interview-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. People & Context */}
                        <div className="space-y-4">
                            <h3 className="text-sm border-b border-slate-800 pb-2 font-bold text-white flex items-center gap-2">
                                <User className="w-4 h-4 text-brand-500" /> Context Mapping
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-300">Select Student</label>
                                    <select
                                        required
                                        value={formData.studentId}
                                        onChange={handleStudentChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                    >
                                        <option value="" disabled>-- Select a Student --</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.fullName} ({s.sapId})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Target Company</label>
                                    <select
                                        required
                                        value={formData.companyId}
                                        onChange={handleCompanyChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                    >
                                        <option value="" disabled>-- Select Company --</option>
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id}>{c.companyName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Drive Title</label>
                                    <select
                                        required
                                        value={formData.driveId}
                                        onChange={handleDriveChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                    >
                                        <option value="" disabled>-- Select Drive --</option>
                                        {formData.companyId ? drives.filter(d => d.companyId === formData.companyId).map(d => (
                                            <option key={d.id} value={d.id}>{d.title}</option>
                                        )) : drives.map(d => (
                                            <option key={d.id} value={d.id}>{d.title} ({d.companyName})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 2. Schedule Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm border-b border-slate-800 pb-2 font-bold text-white flex items-center gap-2">
                                <CalendarClock className="w-4 h-4 text-brand-500" /> Date & Time
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Round Type</label>
                                    <select
                                        name="roundType" value={formData.roundType} onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                    >
                                        <option value="aptitude_test">Aptitude Test</option>
                                        <option value="gd">Group Discussion</option>
                                        <option value="technical_interview">Technical</option>
                                        <option value="hr_interview">HR</option>
                                        <option value="final_round">Final</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Date</label>
                                    <input
                                        type="date" required
                                        value={formData.scheduledDate ? new Date(formData.scheduledDate.getTime() - (formData.scheduledDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : ''}
                                        onChange={handleDateChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500 appearance-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Time</label>
                                    <input
                                        type="time" name="scheduledTime" required
                                        value={formData.scheduledTime} onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500 appearance-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Location & Mode */}
                        <div className="space-y-4">
                            <h3 className="text-sm border-b border-slate-800 pb-2 font-bold text-white flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-brand-500" /> Execution Mode
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Mode</label>
                                    <select
                                        name="mode" value={formData.mode} onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                    >
                                        <option value="online">Online / Virtual</option>
                                        <option value="offline">Offline / In-Person</option>
                                    </select>
                                </div>
                                {formData.mode === 'online' ? (
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-300">Meeting Link</label>
                                        <div className="relative">
                                            <Video className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="url" name="meetingLink"
                                                value={formData.meetingLink || ''} onChange={handleChange}
                                                placeholder="https://meet.google.com/..."
                                                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-300">Physical Location</label>
                                        <input
                                            type="text" name="location"
                                            value={formData.location || ''} onChange={handleChange}
                                            placeholder="Room 101, placement cell..."
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. Panel */}
                        <div className="space-y-4">
                            <h3 className="text-sm border-b border-slate-800 pb-2 font-bold text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-brand-500" /> Panel Assignments
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Panel Name (Optional)</label>
                                    <input
                                        type="text" name="panelName"
                                        value={formData.panelName || ''} onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Panel Members (Comma Separated)</label>
                                    <input
                                        type="text"
                                        value={panelMembersText} onChange={(e) => setPanelMembersText(e.target.value)}
                                        placeholder="email1@comp.com, Name Two..."
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 5. Status Setters (Only for Edit usually, but we allow on Create for overrides) */}
                        {isEditMode && (
                            <div className="space-y-4 pt-4 border-t border-slate-800 border-dashed">
                                <h3 className="text-sm border-b border-slate-800 pb-2 font-bold text-white">Status Tracking Updates</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-300">Schedule Status</label>
                                        <select
                                            name="status" value={formData.status} onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                        >
                                            <option value="scheduled">Scheduled</option>
                                            <option value="rescheduled">Rescheduled</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="no_show">No Show</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-300">Attendance</label>
                                        <select
                                            name="attendanceStatus" value={formData.attendanceStatus} onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="attended">Attended</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-300">Result Status</label>
                                        <select
                                            name="resultStatus" value={formData.resultStatus} onChange={handleChange}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="selected">Selected 🌟</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="on_hold">On Hold</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1 pt-4">
                            <label className="text-xs font-semibold text-slate-300">Administrative Notes</label>
                            <textarea
                                name="notes" rows={3}
                                value={formData.notes || ''} onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500 resize-none"
                                placeholder="Any specific requirements or post-interview remarks..."
                            />
                        </div>

                    </form>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="interview-form"
                        disabled={isSaving}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                {isEditMode ? 'Update' : 'Schedule'}
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
