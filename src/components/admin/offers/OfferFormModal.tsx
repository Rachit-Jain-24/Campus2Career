import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User, Building2, IndianRupee, Calendar as CalendarIcon, Link as LinkIcon } from 'lucide-react';
import type { AdminOffer, OfferFormData } from '../../../types/offerAdmin';
import { useStudents } from '../../../hooks/admin/useStudents';
import { useCompanies } from '../../../hooks/admin/useCompanies';
import { useDrives } from '../../../hooks/admin/useDrives';

interface OfferFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: OfferFormData, meta?: { department: string; year: string }) => Promise<void>;
    initialData?: AdminOffer;
    isSaving: boolean;
}

const DEFAULT_FORM: OfferFormData = {
    studentId: '',
    studentName: '',
    companyId: '',
    companyName: '',
    driveId: '',
    driveTitle: '',
    role: '',
    ctc: 0,
    joiningDate: null,
    location: '',
    bondDuration: 'None',
    offerLetterUrl: '',
    notes: '',
    status: 'issued'
};

export const OfferFormModal: React.FC<OfferFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    isSaving
}) => {
    const { students } = useStudents();
    const { companies } = useCompanies();
    const { drives } = useDrives();

    const [formData, setFormData] = useState<OfferFormData>(DEFAULT_FORM);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData(DEFAULT_FORM);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        let parsedValue: any = value;
        if (type === 'number') {
            parsedValue = value === '' ? 0 : parseFloat(value);
        }

        setFormData(prev => ({ ...prev, [name]: parsedValue }));
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
            const dateObj = new Date(dateStr);
            setFormData(prev => ({ ...prev, joiningDate: dateObj }));
        } else {
            setFormData(prev => ({ ...prev, joiningDate: null }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const studentMetas = students.find(s => s.id === formData.studentId);
        const stMeta = studentMetas ? { department: studentMetas.department, year: studentMetas.currentYear } : undefined;

        await onSave(formData, stMeta);
    };

    const isEditMode = !!initialData;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">

                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-emerald-500" />
                        {isEditMode ? 'Edit Offer Record' : 'Record New Offer'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/80">
                    <form id="offer-form" onSubmit={handleSubmit} className="space-y-8">

                        <div className="space-y-4">
                            <h3 className="text-sm border-b border-slate-800 pb-2 font-bold text-white flex items-center gap-2">
                                <User className="w-4 h-4 text-brand-500" /> Student & Company Mapping
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
                                            <option key={s.id} value={s.id}>{s.fullName} ({s.sapId}) - {s.department}</option>
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
                                    <label className="text-xs font-semibold text-slate-300">Source Drive</label>
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

                        <div className="space-y-4">
                            <h3 className="text-sm border-b border-slate-800 pb-2 font-bold text-white flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-brand-500" /> Offer Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Job Role</label>
                                    <input
                                        type="text" name="role" required
                                        value={formData.role} onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                        placeholder="E.g., Software Development Engineer"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Package (CTC in LPA)</label>
                                    <div className="relative">
                                        <IndianRupee className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="number" name="ctc" required step="0.1" min="0"
                                            value={formData.ctc || ''} onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                            placeholder="12.5"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Joining Location</label>
                                    <input
                                        type="text" name="location" required
                                        value={formData.location} onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                        placeholder="E.g., Bangalore, Remote"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Bond Duration</label>
                                    <input
                                        type="text" name="bondDuration"
                                        value={formData.bondDuration || ''} onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                        placeholder="E.g., None, 1 Year, 2 Years"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm border-b border-slate-800 pb-2 font-bold text-white flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-brand-500" /> Timeline & Context
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Tentative Joining Date</label>
                                    <input
                                        type="date"
                                        value={formData.joiningDate ? new Date(formData.joiningDate.getTime() - (formData.joiningDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : ''}
                                        onChange={handleDateChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500 appearance-none col-span-1"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300">Offer Status</label>
                                    <select
                                        name="status" value={formData.status} onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                    >
                                        <option value="issued">Issued / Extended</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected (by student)</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="expired">Expired / Revoked</option>
                                    </select>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-300">Offer Letter Reference URL</label>
                                    <div className="relative">
                                        <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="url" name="offerLetterUrl"
                                            value={formData.offerLetterUrl || ''} onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500"
                                            placeholder="https://drive.google.com/... or cloud storage link"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-300">Administrative Notes</label>
                                    <textarea
                                        name="notes" rows={2}
                                        value={formData.notes || ''} onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-brand-500 resize-none"
                                        placeholder="Conditions, PPO details, or reasons for rejection..."
                                    />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

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
                        form="offer-form"
                        disabled={isSaving}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                {isEditMode ? 'Update Offer' : 'Record Offer'}
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
