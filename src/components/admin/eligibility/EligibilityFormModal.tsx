import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { AdminEligibilityRule, EligibilityFormData } from '../../../types/eligibilityAdmin';

interface EligibilityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: EligibilityFormData) => Promise<void>;
    initialData?: AdminEligibilityRule;
    isSaving: boolean;
}

export const EligibilityFormModal: React.FC<EligibilityFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    isSaving
}) => {

    const defaultState: EligibilityFormData = {
        ruleName: '',
        description: '',
        minCGPA: 0,
        allowedDepartments: [],
        allowedYears: ['Final Year'],
        maxActiveBacklogs: 0,
        maxHistoryBacklogs: 0,
        requiresResumeApproval: true,
        mandatoryInternship: false,
        requiredSkills: [],
        active: true
    };

    const [formData, setFormData] = useState<EligibilityFormData>(defaultState);

    // UI Local String States for Arrays
    const [departmentsInput, setDepartmentsInput] = useState('');
    const [skillsInput, setSkillsInput] = useState('');
    const [yearsInput, setYearsInput] = useState('Final Year');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({ ...initialData });
                setDepartmentsInput(initialData.allowedDepartments.join(', '));
                setSkillsInput(initialData.requiredSkills.join(', '));
                setYearsInput(initialData.allowedYears.join(', '));
            } else {
                setFormData(defaultState);
                setDepartmentsInput('');
                setSkillsInput('');
                setYearsInput('Final Year');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalData: EligibilityFormData = {
            ...formData,
            allowedDepartments: departmentsInput.split(',').map(s => s.trim()).filter(Boolean),
            requiredSkills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
            allowedYears: yearsInput.split(',').map(s => s.trim()).filter(Boolean),
        };

        await onSave(finalData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        let parsedValue: any = value;
        if (type === 'number') {
            parsedValue = parseFloat(value) || 0;
        }

        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleCheckboxChange = (name: keyof EligibilityFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    };

    const isEditMode = !!initialData;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] animate-fade-in-up">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                    <h2 className="text-xl font-bold text-white">
                        {isEditMode ? 'Edit Eligibility Ruleset' : 'Create Standard Eligibility Rule'}
                    </h2>
                    <button onClick={onClose} disabled={isSaving} className="p-2 text-slate-400 hover:text-white rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form id="eligibility-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">

                    {/* Meta Identification */}
                    <section>
                        <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Rule Identification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Rule Blueprint Name *</label>
                                <input required type="text" name="ruleName" value={formData.ruleName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-brand-500" placeholder="e.g. Standard IT Recruiter Rule" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Internal Description / Memo</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 resize-none font-medium custom-scrollbar" placeholder="Details about where this logic is usually applied..." />
                            </div>

                            <div className="md:col-span-2 flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" checked={formData.active} onChange={handleCheckboxChange('active')} className="peer sr-only" />
                                        <div className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-900 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Active System Rule</span>
                                </label>
                                <span className="text-xs text-slate-500 italic">(Drives cannot attach inactive rules)</span>
                            </div>
                        </div>
                    </section>

                    {/* Strict Academic Criteria */}
                    <section>
                        <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Strict Academic Checks</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Absolute Min CGPA</label>
                                <input type="number" step="0.1" name="minCGPA" value={formData.minCGPA || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200" placeholder="e.g. 7.5" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Current Active Backlogs</label>
                                <input type="number" name="maxActiveBacklogs" value={formData.maxActiveBacklogs} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Max Historic Backlogs (Dead or Alive)</label>
                                <input type="number" name="maxHistoryBacklogs" value={formData.maxHistoryBacklogs} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200" />
                            </div>

                        </div>
                    </section>

                    {/* Meta Criteria */}
                    <section>
                        <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Demographic Targeting & Flags</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Permitted Departments (CSV)</label>
                                <input type="text" value={departmentsInput} onChange={(e) => setDepartmentsInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200" placeholder="e.g. Computer Eng, IT Eng" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Allowed Study Years (CSV)</label>
                                <input type="text" value={yearsInput} onChange={(e) => setYearsInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200" placeholder="e.g. Third Year, Final Year" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Must-Have Skills / Tags (CSV)</label>
                                <input type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200" placeholder="e.g. React, Java, Node" />
                            </div>

                            <div className="md:col-span-2 flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" checked={formData.requiresResumeApproval} onChange={handleCheckboxChange('requiresResumeApproval')} className="peer sr-only" />
                                        <div className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-900 peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-all flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Requires Valid T&P Resume</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" checked={formData.mandatoryInternship} onChange={handleCheckboxChange('mandatoryInternship')} className="peer sr-only" />
                                        <div className="w-5 h-5 border-2 border-slate-600 rounded bg-slate-900 peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-all flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Strict Internship Pre-requisite</span>
                                </label>
                            </div>
                        </div>
                    </section>

                </form>

                {/* Footer Controls */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 shrink-0 bg-slate-900/50 rounded-b-2xl">
                    <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white mr-3">
                        Cancel
                    </button>
                    <button type="submit" form="eligibility-form" disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg shadow-lg">
                        {isSaving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4" /> {isEditMode ? 'Update' : 'Save'} Configuration</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
