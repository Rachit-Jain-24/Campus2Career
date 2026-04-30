import { useState, useRef, useEffect } from 'react';
import {
  Upload, CheckCircle2, AlertCircle, RefreshCw,
  BookOpen, Layers, X, Plus, Pencil, Trash2,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  Sparkles, FileText, Tag
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { extractTextFromLocalPDF } from '../../lib/pdfParser';
import { copilotEngine } from '../../lib/ai/copilotEngine';
import { curriculumDb } from '../../services/db/database.service';
import type { CurriculumSubjectEntry } from '../../services/db/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubjectFormState {
  subjectCode: string;
  subjectName: string;
  description: string;
  topics: string;        // comma-separated in form
  industrySkills: string; // comma-separated in form
  industryRelevance: 'high' | 'medium' | 'low';
  semester: number;
}

const EMPTY_FORM: SubjectFormState = {
  subjectCode: '',
  subjectName: '',
  description: '',
  topics: '',
  industrySkills: '',
  industryRelevance: 'medium',
  semester: 1,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const relevanceBadge = (r: string) => {
  if (r === 'high')   return 'bg-green-50 text-green-700 border-green-200';
  if (r === 'medium') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-500 border-slate-200';
};

// ─── Component ────────────────────────────────────────────────────────────────

export const CurriculumManager = () => {
  const [branch, setBranch] = useState('B.Tech CSE (DS)');
  const [batch, setBatch]   = useState('2022-2026');

  const [subjects, setSubjects]         = useState<CurriculumSubjectEntry[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);

  // Expanded semesters
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 1: true });

  // Modal state
  const [showForm, setShowForm]         = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [form, setForm]                 = useState<SubjectFormState>(EMPTY_FORM);
  const [formSaving, setFormSaving]     = useState(false);

  // PDF parsing state
  const [parsingPdf, setParsingPdf]     = useState(false);
  const [pdfSemester, setPdfSemester]   = useState(1);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── Load subjects ────────────────────────────────────────────────────────
  const loadSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await curriculumDb.getSubjects(branch, batch);
      setSubjects(data);
    } catch (e: any) {
      setError('Unable to load curriculum. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubjects(); }, [branch, batch]);

  // ── Group by semester ────────────────────────────────────────────────────
  const bySemester = subjects.reduce<Record<number, CurriculumSubjectEntry[]>>((acc, s) => {
    if (!acc[s.semester]) acc[s.semester] = [];
    acc[s.semester].push(s);
    return acc;
  }, {});

  const semesters = Array.from(
    new Set([...Object.keys(bySemester).map(Number), ...Array.from({ length: 8 }, (_, i) => i + 1)])
  ).sort((a, b) => a - b);

  // ── Toggle active ────────────────────────────────────────────────────────
  const handleToggle = async (subject: CurriculumSubjectEntry) => {
    if (!subject.id) return;
    const next = !subject.isActive;
    setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, isActive: next } : s));
    try {
      await curriculumDb.toggleSubject(subject.id, next);
      flash(`"${subject.subjectName}" marked ${next ? 'active' : 'inactive'}.`);
    } catch {
      setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, isActive: !next } : s));
      setError('Failed to update subject status. Please try again.');
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (subject: CurriculumSubjectEntry) => {
    if (!subject.id) return;
    if (!confirm(`Delete "${subject.subjectName}"? This cannot be undone.`)) return;
    setSubjects(prev => prev.filter(s => s.id !== subject.id));
    try {
      await curriculumDb.deleteSubject(subject.id);
      flash(`"${subject.subjectName}" deleted.`);
    } catch {
      setError('Failed to delete subject. Please try again.');
      loadSubjects();
    }
  };

  // ── Open form ────────────────────────────────────────────────────────────
  const openAdd = (semester: number) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, semester });
    setShowForm(true);
  };

  const openEdit = (s: CurriculumSubjectEntry) => {
    setEditingId(s.id || null);
    setForm({
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      description: s.description,
      topics: s.topics.join(', '),
      industrySkills: s.industrySkills.join(', '),
      industryRelevance: s.industryRelevance,
      semester: s.semester,
    });
    setShowForm(true);
  };

  // ── Save form ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.subjectName.trim()) { setError('Subject name is required.'); return; }
    setFormSaving(true);
    setError(null);
    try {
      const payload: CurriculumSubjectEntry = {
        branch,
        batch,
        semester: form.semester,
        subjectCode: form.subjectCode.trim(),
        subjectName: form.subjectName.trim(),
        description: form.description.trim(),
        topics: form.topics.split(',').map(t => t.trim()).filter(Boolean),
        industrySkills: form.industrySkills.split(',').map(t => t.trim()).filter(Boolean),
        industryRelevance: form.industryRelevance,
        isActive: true,
        uploadedBy: 'Program Chair',
      };

      if (editingId) {
        await curriculumDb.updateSubject(editingId, payload);
        setSubjects(prev => prev.map(s => s.id === editingId ? { ...s, ...payload, id: editingId } : s));
        flash('Subject updated successfully.');
      } else {
        const saved = await curriculumDb.saveSubject(payload);
        setSubjects(prev => [...prev, saved]);
        flash('Subject added to knowledge base.');
      }
      setShowForm(false);
    } catch (e: any) {
      setError(e.message || 'Failed to save subject. Please try again.');
    } finally {
      setFormSaving(false);
    }
  };

  // ── PDF bulk import ──────────────────────────────────────────────────────
  const handlePdfUpload = async (file: File) => {
    setParsingPdf(true);
    setError(null);
    try {
      // 1. Extract text
      const text = await extractTextFromLocalPDF(file);
      if (!text.trim()) throw new Error('Could not extract text from PDF.');

      // 2. Upload PDF to Supabase Storage
      const storagePath = `curriculum/${branch}/${batch}/sem${pdfSemester}/${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from('curriculum')
        .upload(storagePath, file, { upsert: true });
      const pdfUrl = uploadErr ? null : supabase.storage.from('curriculum').getPublicUrl(storagePath).data.publicUrl;

      // 3. AI parse into subjects
      const prompt = `
You are analyzing a university semester syllabus PDF for Semester ${pdfSemester} of ${branch} (${batch}).

Extract ALL subjects from this syllabus. For each subject, identify:
- Subject code (if present)
- Subject name
- A brief description (1-2 sentences)
- Key topics covered (list of 3-8 specific topics)
- Industry-relevant skills this subject builds (list of 3-6 skills)
- Industry relevance for tech placements: "high", "medium", or "low"

SYLLABUS TEXT:
${text.slice(0, 12000)}

Return ONLY valid JSON:
{
  "subjects": [
    {
      "subjectCode": "CS301",
      "subjectName": "Data Structures and Algorithms",
      "description": "Covers fundamental data structures and algorithm design techniques.",
      "topics": ["Arrays", "Linked Lists", "Trees", "Graphs", "Sorting", "Dynamic Programming"],
      "industrySkills": ["Problem Solving", "Algorithm Design", "Competitive Programming"],
      "industryRelevance": "high"
    }
  ]
}`;

      const aiResponse = await copilotEngine.callLLM(prompt, { json: true });
      const parsed = JSON.parse(aiResponse);
      if (!parsed.subjects?.length) throw new Error('No subjects found in PDF.');

      // 4. Save all to knowledge base
      const saved: CurriculumSubjectEntry[] = [];
      for (const sub of parsed.subjects) {
        const entry: CurriculumSubjectEntry = {
          branch, batch,
          semester: pdfSemester,
          subjectCode: sub.subjectCode || '',
          subjectName: sub.subjectName,
          description: sub.description || '',
          topics: sub.topics || [],
          industrySkills: sub.industrySkills || [],
          industryRelevance: sub.industryRelevance || 'medium',
          isActive: true,
          pdfUrl: pdfUrl || undefined,
          uploadedBy: 'Program Chair',
        };
        const result = await curriculumDb.saveSubject(entry);
        saved.push(result);
      }

      setSubjects(prev => {
        // Remove old entries for this semester (replaced by fresh parse)
        const filtered = prev.filter(s => s.semester !== pdfSemester);
        return [...filtered, ...saved];
      });
      setExpanded(prev => ({ ...prev, [pdfSemester]: true }));
      flash(`Imported ${saved.length} subjects from Semester ${pdfSemester} PDF.`);
    } catch (e: any) {
      setError(e.message || 'Failed to parse PDF. Please try again.');
    } finally {
      setParsingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Layers className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Curriculum Knowledge Base</h1>
            <p className="text-xs text-slate-500 font-medium">Manage subjects per semester — active subjects power AI roadmaps</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select value={branch} onChange={e => setBranch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30">
            <option>B.Tech CSE (DS)</option>
            <option>B.Tech CSE</option>
            <option>B.Tech IT</option>
          </select>
          <select value={batch} onChange={e => setBatch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30">
            <option>2022-2026</option>
            <option>2023-2027</option>
            <option>2024-2028</option>
          </select>
        </div>
      </div>

      {/* PDF Bulk Import */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <p className="text-sm font-black text-slate-700">AI Bulk Import from PDF</p>
          <span className="text-xs text-slate-400 font-medium">— upload a semester syllabus PDF and AI extracts all subjects automatically</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={pdfSemester} onChange={e => setPdfSemester(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30">
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
            ))}
          </select>
          <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden"
            onChange={e => e.target.files?.[0] && handlePdfUpload(e.target.files[0])} />
          <button
            onClick={() => pdfInputRef.current?.click()}
            disabled={parsingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-all">
            {parsingPdf
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Parsing PDF...</>
              : <><Upload className="h-4 w-4" /> Upload & Parse PDF</>}
          </button>
          <span className="text-xs text-slate-400">Replaces existing subjects for the selected semester</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Semester Accordions */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin mr-3" /> Loading knowledge base...
        </div>
      ) : (
        <div className="space-y-3">
          {semesters.map(sem => {
            const semSubjects = bySemester[sem] || [];
            const activeCount = semSubjects.filter(s => s.isActive).length;
            const isOpen = expanded[sem] ?? false;

            return (
              <div key={sem} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Semester header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(prev => ({ ...prev, [sem]: !isOpen }))}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black">
                      S{sem}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">Semester {sem}</p>
                      <p className="text-xs text-slate-400">
                        {semSubjects.length} subjects · {activeCount} active
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); openAdd(sem); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-black transition-all">
                      <Plus className="h-3 w-3" /> Add Subject
                    </button>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {/* Subject list */}
                {isOpen && (
                  <div className="border-t border-slate-50 divide-y divide-slate-50">
                    {semSubjects.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        No subjects yet. Add manually or import from PDF.
                      </div>
                    ) : (
                      semSubjects.map(subject => (
                        <div key={subject.id}
                          className={`flex items-start gap-4 p-4 transition-colors ${subject.isActive ? 'bg-white' : 'bg-slate-50/60 opacity-60'}`}>
                          <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            <BookOpen className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {subject.subjectCode && (
                                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {subject.subjectCode}
                                </span>
                              )}
                              <p className="text-sm font-bold text-slate-800">{subject.subjectName}</p>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${relevanceBadge(subject.industryRelevance)}`}>
                                {subject.industryRelevance}
                              </span>
                            </div>
                            {subject.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subject.description}</p>
                            )}
                            {subject.industrySkills.length > 0 && (
                              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                <Tag className="h-3 w-3 text-slate-300" />
                                {subject.industrySkills.slice(0, 4).map(skill => (
                                  <span key={skill} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-medium">
                                    {skill}
                                  </span>
                                ))}
                                {subject.industrySkills.length > 4 && (
                                  <span className="text-[10px] text-slate-400">+{subject.industrySkills.length - 4} more</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleToggle(subject)}
                              title={subject.isActive ? 'Deactivate' : 'Activate'}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                              {subject.isActive
                                ? <ToggleRight className="h-5 w-5 text-green-500" />
                                : <ToggleLeft className="h-5 w-5 text-slate-300" />}
                            </button>
                            <button onClick={() => openEdit(subject)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                              <Pencil className="h-4 w-4 text-slate-400" />
                            </button>
                            <button onClick={() => handleDelete(subject)}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats footer */}
      {!loading && subjects.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-white font-bold text-sm">Knowledge Base Active</p>
              <p className="text-white/50 text-xs">
                {subjects.filter(s => s.isActive).length} of {subjects.length} subjects active · powering AI roadmaps
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
            <FileText className="h-4 w-4" />
            {branch} · {batch}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-800">
                {editingId ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Semester</label>
                  <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30">
                    {Array.from({ length: 8 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Subject Code</label>
                  <input value={form.subjectCode} onChange={e => setForm(f => ({ ...f, subjectCode: e.target.value }))}
                    placeholder="e.g. CS301"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Subject Name *</label>
                <input value={form.subjectName} onChange={e => setForm(f => ({ ...f, subjectName: e.target.value }))}
                  placeholder="e.g. Data Structures and Algorithms"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Brief description of the subject"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30 resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Topics (comma-separated)</label>
                <input value={form.topics} onChange={e => setForm(f => ({ ...f, topics: e.target.value }))}
                  placeholder="Arrays, Linked Lists, Trees, Graphs"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Industry Skills (comma-separated)</label>
                <input value={form.industrySkills} onChange={e => setForm(f => ({ ...f, industrySkills: e.target.value }))}
                  placeholder="Problem Solving, Algorithm Design, DSA"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Industry Relevance</label>
                <select value={form.industryRelevance} onChange={e => setForm(f => ({ ...f, industryRelevance: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-400/30">
                  <option value="high">High — Core tech skill</option>
                  <option value="medium">Medium — Useful foundation</option>
                  <option value="low">Low — General education</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={formSaving}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-all">
                {formSaving ? 'Saving...' : editingId ? 'Update Subject' : 'Add Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
