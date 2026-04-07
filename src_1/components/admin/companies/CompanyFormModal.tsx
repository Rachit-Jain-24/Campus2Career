import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
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
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0 bg-secondary/10">
                    <h2 className="text-xl font-black text-foreground">
                        {isEditMode ? 'Edit Company Profile' : 'Add New Company'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        disabled={isSaving}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="company-form" onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">

                    {/* Basic Info */}
                    <section>
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 border-b border-border pb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px]">1</span>
                            Basic Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Company Name *</label>
                                <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Industry</label>
                                <select name="industry" value={formData.industry} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium">
                                    {MOCK_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Website URL</label>
                                <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="https://" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="e.g. Bangalore" />
                            </div>
                        </div>
                    </section>

                    {/* HR Contact */}
                    <section>
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 border-b border-border pb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px]">2</span>
                            HR Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Contact Name *</label>
                                <input required type="text" name="hrName" value={formData.hrName} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Email *</label>
                                <input required type="email" name="hrEmail" value={formData.hrEmail} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Phone Number</label>
                                <input type="text" name="hrPhone" value={formData.hrPhone} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="+91..." />
                            </div>
                        </div>
                    </section>

                    {/* Placement Rules */}
                    <section>
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 border-b border-border pb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px]">3</span>
                            Placement Rules
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium uppercase font-black text-[10px]">
                                    <option value="active">Active</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blacklisted">Blacklisted</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Hiring Mode</label>
                                <select name="hiringMode" value={formData.hiringMode} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium uppercase font-black text-[10px]">
                                    <option value="on-campus">On Campus</option>
                                    <option value="pool-campus">Pool Campus</option>
                                    <option value="off-campus">Off Campus</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Package Range (LPA)</label>
                                <input type="text" name="packageRange" value={formData.packageRange} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="e.g. 5.0 - 7.5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1 flex items-center gap-2">
                                    Eligible Departments
                                    <span className="group relative">
                                        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl z-10">Comma separated (e.g. IT Eng, Computer Eng)</div>
                                    </span>
                                </label>
                                <input type="text" value={deptsInput} onChange={(e) => setDeptsInput(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="Computer Eng, IT Eng" />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-tight ml-1">Job Roles Provided (Comma separated)</label>
                                <input type="text" value={rolesInput} onChange={(e) => setRolesInput(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="Software Engineer, Data Analyst" />
                            </div>
                        </div>
                    </section>

                    {/* Metadata */}
                    <section>
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 border-b border-border pb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px]">4</span>
                            Internal Notes
                        </h3>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none shadow-sm"
                            placeholder="Add any internal remarks, history notes, or warnings..."
                        />
                    </section>

                </form>

                {/* Footer Controls */}
                <div className="flex items-center justify-end px-6 py-5 border-t border-border shrink-0 bg-secondary/10 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-all mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="company-form"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                    >
                        {isSaving ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> {isEditMode ? 'Update' : 'Create'} Company</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
