import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { AdminCompanyProfile, CompanyFormData } from '../../../types/companyAdmin';
import { MOCK_INDUSTRIES, MOCK_LOCATIONS } from '../../../data/mock/adminCompaniesData';

interface CompanyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CompanyFormData) => Promise<void>;
    initialData?: AdminCompanyProfile; // Undefined means Add mode
    isSaving: boolean;
}

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    isSaving
}) => {

    // Default form state
    const defaultState: CompanyFormData = {
        companyName: '',
        industry: MOCK_INDUSTRIES[0],
        website: '',
        hrName: '',
        hrEmail: '',
        hrPhone: '',
        packageRange: '',
        eligibleDepartments: [],
        location: MOCK_LOCATIONS[0],
        hiringMode: 'on-campus',
        jobRoles: [],
        status: 'upcoming',
        notes: ''
    };

    const [formData, setFormData] = useState<CompanyFormData>(defaultState);
    const [rolesInput, setRolesInput] = useState('');
    const [deptsInput, setDeptsInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData
                });
                setRolesInput(initialData.jobRoles.join(', '));
                setDeptsInput(initialData.eligibleDepartments.join(', '));
            } else {
                setFormData(defaultState);
                setRolesInput('');
                setDeptsInput('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Parse array fields
        const rolesArray = rolesInput.split(',').map(s => s.trim()).filter(Boolean);
        const deptsArray = deptsInput.split(',').map(s => s.trim()).filter(Boolean);

        const finalData: CompanyFormData = {
            ...formData,
            jobRoles: rolesArray,
            eligibleDepartments: deptsArray
        };

        await onSave(finalData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isEditMode = !!initialData;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                    <h2 className="text-xl font-bold text-white">
                        {isEditMode ? 'Edit Company Profile' : 'Add New Company'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        disabled={isSaving}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="company-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">

                    {/* Basic Info */}
                    <section>
                        <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
                                <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Industry</label>
                                <select name="industry" value={formData.industry} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500">
                                    {MOCK_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Website URL</label>
                                <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500" placeholder="https://" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500" placeholder="e.g. Bangalore" />
                            </div>
                        </div>
                    </section>

                    {/* HR Contact */}
                    <section>
                        <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">HR Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Contact Name *</label>
                                <input required type="text" name="hrName" value={formData.hrName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                                <input required type="email" name="hrEmail" value={formData.hrEmail} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                                <input type="text" name="hrPhone" value={formData.hrPhone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500" placeholder="+91..." />
                            </div>
                        </div>
                    </section>

                    {/* Placement Rules */}
                    <section>
                        <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Placement Rules</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500">
                                    <option value="active">Active</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blacklisted">Blacklisted</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Hiring Mode</label>
                                <select name="hiringMode" value={formData.hiringMode} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500">
                                    <option value="on-campus">On Campus</option>
                                    <option value="pool-campus">Pool Campus</option>
                                    <option value="off-campus">Off Campus</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Package Range (LPA)</label>
                                <input type="text" name="packageRange" value={formData.packageRange} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500" placeholder="e.g. 5.0 - 7.5 LPA" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                                    Eligible Departments
                                    <span className="group relative">
                                        <AlertCircle className="w-4 h-4 text-slate-500" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-xs text-slate-300 p-2 rounded shrink-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">Comma separated (e.g. IT Eng, Computer Eng)</div>
                                    </span>
                                </label>
                                <input type="text" value={deptsInput} onChange={(e) => setDeptsInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500" placeholder="Computer Eng, IT Eng" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Job Roles Provided (Comma separated)</label>
                                <input type="text" value={rolesInput} onChange={(e) => setRolesInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500" placeholder="Software Engineer, Data Analyst" />
                            </div>
                        </div>
                    </section>

                    {/* Metadata */}
                    <section>
                        <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Internal Notes</h3>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-brand-500 resize-none"
                            placeholder="Add any internal remarks, history notes, or warnings..."
                        />
                    </section>

                </form>

                {/* Footer Controls */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 shrink-0 bg-slate-900/50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors mr-3"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="company-form"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4" /> {isEditMode ? 'Update' : 'Create'} Company</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
