import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import type { AdminDriveProfile, DriveFormData, DriveStage } from '../../../types/driveAdmin';
import { useCompanies } from '../../../hooks/admin/useCompanies';

interface DriveFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: DriveFormData) => Promise<void>;
    initialData?: AdminDriveProfile;
    isSaving: boolean;
}

export const DriveFormModal: React.FC<DriveFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    isSaving
}) => {

    // Internal light fetch of companies for the dropdown
    const { companies } = useCompanies();

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const defaultState: DriveFormData = {
        companyId: '',
        companyName: '',
        title: '',
        jobRole: '',
        packageRange: '',
        location: '',
        mode: 'on-campus',
        description: '',
        status: 'draft',
        registrationStart: new Date(),
        registrationEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),

        eligibilityRules: {
            minCGPA: 0,
            allowedDepartments: [],
            allowedYears: ['Final Year'],
            maxActiveBacklogs: 0,
            maxHistoryBacklogs: 0,
            requiresResumeApproval: true,
            mandatoryInternship: false,
            requiredSkills: []
        },
        stages: []
    };

    const [formData, setFormData] = useState<DriveFormData>(defaultState);

    // UI Local String States for Arrays
    const [departmentsInput, setDepartmentsInput] = useState('');
    const [skillsInput, setSkillsInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData
                });
                setDepartmentsInput(initialData.eligibilityRules.allowedDepartments.join(', '));
                setSkillsInput(initialData.eligibilityRules.requiredSkills.join(', '));
            } else {
                setFormData(defaultState);
                setDepartmentsInput('');
                setSkillsInput('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Find Company Name based on selected ID
        const selectedCompany = companies.find(c => c.id === formData.companyId);

        const finalData: DriveFormData = {
            ...formData,
            companyName: selectedCompany ? selectedCompany.companyName : formData.companyName,
            eligibilityRules: {
                ...formData.eligibilityRules,
                allowedDepartments: departmentsInput.split(',').map(s => s.trim()).filter(Boolean),
                requiredSkills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
            }
        };

        await onSave(finalData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEligibilityChange = (name: keyof DriveFormData['eligibilityRules'], value: any) => {
        setFormData(prev => ({
            ...prev,
            eligibilityRules: { ...prev.eligibilityRules, [name]: value }
        }));
    };

    const handleDateChange = (name: 'registrationStart' | 'registrationEnd', value: string) => {
        setFormData(prev => ({ ...prev, [name]: new Date(value) }));
    };

    // Stage Array Helpers
    const addStage = () => {
        setFormData(prev => ({
            ...prev,
            stages: [...prev.stages, { id: generateId(), name: 'New Round', date: null, status: 'pending' }]
        }));
    };

    const updateStage = (id: string, field: keyof DriveStage, value: any) => {
        setFormData(prev => ({
            ...prev,
            stages: prev.stages.map(stage => stage.id === id ? { ...stage, [field]: value } : stage)
        }));
    };

    const removeStage = (id: string) => {
        setFormData(prev => ({
            ...prev,
            stages: prev.stages.filter(stage => stage.id !== id)
        }));
    };

    const isEditMode = !!initialData;

    // Format dates for html inputs handling local timezone appropriately
    const formatDateForInput = (d: Date) => {
        try {
            return d.toISOString().split('T')[0];
        } catch {
            return new Date().toISOString().split('T')[0];
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[95vh] animate-fade-in-up">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <h2 className="text-xl font-bold text-foreground">
                        {isEditMode ? 'Edit Drive Configuration' : 'Create Placement Drive'}
                    </h2>
                    <button onClick={onClose} disabled={isSaving} className="p-2 text-muted-foreground hover:text-foreground rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form id="drive-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">

                    {/* Core Config */}
                    <section>
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">Core Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-1">Drive Title (Campaign Name) *</label>
                                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200 focus:border-primary" placeholder="e.g. Google Summer Hiring 2024" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Linking Partner Company *</label>
                                <select required name="companyId" value={formData.companyId} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200 focus:border-primary">
                                    <option value="" disabled>-- Select Company --</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Target Job Role *</label>
                                <input required type="text" name="jobRole" value={formData.jobRole} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200 focus:border-primary" placeholder="e.g. SDE-1" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Package / CTC *</label>
                                <input required type="text" name="packageRange" value={formData.packageRange} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200 focus:border-primary" placeholder="e.g. 15.0 - 20.0 LPA" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Location of Job *</label>
                                <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200 focus:border-primary" placeholder="e.g. Bangalore, Remote" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Hiring Mode / Venue</label>
                                <select name="mode" value={formData.mode} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200">
                                    <option value="on-campus">On Campus</option>
                                    <option value="pool-campus">Pool Campus</option>
                                    <option value="off-campus">Off Campus / Remote</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Drive Global Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200">
                                    <option value="draft">Draft (Hidden)</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="registration_open">Registration Open</option>
                                    <option value="ongoing">Ongoing Trials</option>
                                    <option value="completed">Completed / Result Out</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Timeline & Registration */}
                    <section>
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">Timeline Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 bg-secondary/20 p-4 border border-border/50 rounded-xl">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Registration Opens</label>
                                <input type="date" value={formatDateForInput(formData.registrationStart)} onChange={(e) => handleDateChange('registrationStart', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200 custom-date-picker" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Registration Deadline</label>
                                <input type="date" value={formatDateForInput(formData.registrationEnd)} onChange={(e) => handleDateChange('registrationEnd', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200 custom-date-picker" />
                            </div>
                        </div>

                        {/* Dynamics Stages Builder */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-foreground">Selection Stages Overview</label>
                                <button type="button" onClick={addStage} className="text-xs font-semibold text-primary hover:text-brand-300 flex items-center gap-1 bg-primary/10 hover:bg-primary/10 px-2 py-1 rounded">
                                    <Plus className="w-3 h-3" /> Add Round
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.stages.length === 0 && (
                                    <div className="p-4 border border-dashed border-border rounded-lg text-center text-sm text-muted-foreground">
                                        No stages configured yet.
                                    </div>
                                )}
                                {formData.stages.map((stage, index) => (
                                    <div key={stage.id} className="flex gap-3 bg-card border border-border p-3 rounded-lg items-start">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground font-bold border border-border mt-1">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 relative">
                                            <input type="text" value={stage.name} onChange={(e) => updateStage(stage.id, 'name', e.target.value)} placeholder="Round Name (e.g. Aptitude Test)" className="bg-background border border-border rounded p-2 text-sm text-foreground" />
                                            <div className="flex gap-2">
                                                <input type="date" value={stage.date ? formatDateForInput(stage.date) : ''} onChange={(e) => updateStage(stage.id, 'date', e.target.value ? new Date(e.target.value) : null)} className="bg-background border border-border rounded p-2 text-sm text-foreground flex-1 custom-date-picker" />
                                                <select value={stage.status} onChange={(e) => updateStage(stage.id, 'status', e.target.value)} className="bg-background border border-border rounded p-2 text-sm text-foreground flex-1">
                                                    <option value="pending">Pending</option>
                                                    <option value="active">Active</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                                <button type="button" onClick={() => removeStage(stage.id)} className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-secondary rounded">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Eligibility Builder */}
                    <section>
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">Strict Eligibility Rules</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Min CGPA Required</label>
                                <input type="number" step="0.1" value={formData.eligibilityRules.minCGPA || ''} onChange={(e) => handleEligibilityChange('minCGPA', parseFloat(e.target.value) || 0)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200" placeholder="e.g. 7.5" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Max Active Backlogs</label>
                                <input type="number" value={formData.eligibilityRules.maxActiveBacklogs || 0} onChange={(e) => handleEligibilityChange('maxActiveBacklogs', parseInt(e.target.value) || 0)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Max History Backlogs</label>
                                <input type="number" value={formData.eligibilityRules.maxHistoryBacklogs || 0} onChange={(e) => handleEligibilityChange('maxHistoryBacklogs', parseInt(e.target.value) || 0)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200" />
                            </div>

                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Allowed Departments (Comma separated)</label>
                                    <input type="text" value={departmentsInput} onChange={(e) => setDepartmentsInput(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200" placeholder="Computer Eng, IT Eng, AI/ML" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Mandatory Tech Skills (Comma separated)</label>
                                    <input type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-slate-200" placeholder="Java, AWS, DSA" />
                                </div>
                            </div>

                            <div className="md:col-span-3 flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" checked={formData.eligibilityRules.requiresResumeApproval} onChange={(e) => handleEligibilityChange('requiresResumeApproval', e.target.checked)} className="peer sr-only" />
                                        <div className="w-5 h-5 border-2 border-slate-600 rounded bg-card peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-all flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-foreground group-hover:text-foreground transition-colors">T&P Resume Approval Mandatory</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" checked={formData.eligibilityRules.mandatoryInternship} onChange={(e) => handleEligibilityChange('mandatoryInternship', e.target.checked)} className="peer sr-only" />
                                        <div className="w-5 h-5 border-2 border-slate-600 rounded bg-card peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-all flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-foreground group-hover:text-foreground transition-colors">Prior Internship Required</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Metadata Overview */}
                    <section>
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">Description / Public Instructions</h3>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-slate-200 resize-none font-medium custom-scrollbar"
                            placeholder="Add drive specifics, instructions for students, or important reminders..."
                        />
                    </section>

                </form>

                {/* Footer Controls */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-border shrink-0 bg-card/50 rounded-b-2xl">
                    <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-foreground hover:text-foreground mr-3">
                        Cancel
                    </button>
                    <button type="submit" form="drive-form" disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-brand-500 text-foreground text-sm font-semibold rounded-lg shadow-lg">
                        {isSaving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4" /> {isEditMode ? 'Update' : 'Create'} Drive</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
