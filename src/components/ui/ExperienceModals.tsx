import { useState } from 'react';
import {
    X, Upload, Code2, Database, LayoutTemplate, Smartphone,
    Globe, Server, Shield, BrainCircuit, LineChart, Briefcase
} from 'lucide-react';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: any) => void;
}

const DOMAIN_SUGGESTIONS = [
    { label: 'Frontend / Web', icon: LayoutTemplate, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Backend / APIs', icon: Server, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Full Stack', icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Mobile App', icon: Smartphone, color: 'text-pink-500', bg: 'bg-pink-50' },
    { label: 'AI / Machine Learning', icon: BrainCircuit, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Data Science', icon: LineChart, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Database / ETL', icon: Database, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { label: 'Cybersecurity', icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
];

export function AddProjectModal({ isOpen, onClose, onSave }: ProjectModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');
    const [techStack, setTechStack] = useState('');

    if (!isOpen) return null;

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!title || !description || !selectedDomain) {
            alert("Please fill in the project title, description, and select a domain.");
            return;
        }

        const newProject = {
            id: Date.now().toString(),
            title,
            description,
            link,
            domain: selectedDomain,
            tags: techStack.split(',').map(t => t.trim()).filter(t => t.length > 0)
        };

        onSave(newProject);
        // Reset form
        setTitle('');
        setDescription('');
        setLink('');
        setSelectedDomain('');
        setTechStack('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Code2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Add Major Project</h2>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Build Your Portfolio</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">1. What did you build?</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., E-Commerce Platform, Plant Disease Detector"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">2. Select Project Domain</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {DOMAIN_SUGGESTIONS.map((domain) => (
                                <button
                                    key={domain.label}
                                    onClick={() => setSelectedDomain(domain.label)}
                                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col items-center justify-center gap-2 text-center
                                        ${selectedDomain === domain.label
                                            ? `border-indigo-500 bg-indigo-50`
                                            : `border-slate-100 bg-slate-50 hover:border-slate-300`}`}
                                >
                                    <domain.icon className={`h-6 w-6 ${domain.color}`} />
                                    <span className={`text-[10px] font-bold ${selectedDomain === domain.label ? 'text-indigo-700' : 'text-slate-600'}`}>
                                        {domain.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">3. Tech Stack Used</label>
                        <input
                            value={techStack}
                            onChange={(e) => setTechStack(e.target.value)}
                            placeholder="e.g., React, Node.js, MongoDB, Express (comma separated)"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">4. Project Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Briefly explain what problem you solved and your role in it..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">5. Live Link / Repository (Optional)</label>
                        <div className="flex gap-2">
                            <input
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                type="url"
                                placeholder="https://github.com/..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-indigo-600"
                            />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                    >
                        <Upload className="h-4 w-4" /> Save Project
                    </button>
                </div>
            </div>
        </div>
    );
}

interface InternshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (internship: any) => void;
}

export function AddInternshipModal({ isOpen, onClose, onSave }: InternshipModalProps) {
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [period, setPeriod] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!company || !role || !period) {
            alert("Please fill in all required fields.");
            return;
        }

        const newInternship = {
            id: Date.now().toString(),
            company,
            role,
            period,
            description,
        };

        onSave(newInternship);
        setCompany('');
        setRole('');
        setPeriod('');
        setDescription('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-teal-100 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Log Industry Experience</h2>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Internship Details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Company Name</label>
                        <input
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g., Google, TCS, Local Startup"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-semibold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Role / Title</label>
                            <input
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g., SDE Intern"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-semibold"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Duration</label>
                            <input
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                placeholder="e.g., 2 Months, Summer 2025"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-semibold"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Key Responsibilities (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What did you work on? What value did you add?"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2"
                    >
                        <Briefcase className="h-4 w-4" /> Save Experience
                    </button>
                </div>
            </div>
        </div>
    );
}

