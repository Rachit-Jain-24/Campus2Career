import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Plus, X, ArrowUp, ArrowDown, Play, AlertTriangle, Sparkles } from 'lucide-react';
import type { Difficulty, InterviewMode, InterviewRound, SessionConfig } from '../../types/interview';
import { DIFFICULTY_INFO, ROUND_TEMPLATES, COMPANIES, CODE_LANGUAGES } from '../../lib/interviewEngine';
import { extractTextFromLocalPDF } from '../../lib/pdfParser';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  defaultRole: string;
  defaultResumeName: string;
  defaultResumeText: string;
  onStart: (config: SessionConfig) => void;
}

export function InterviewLobby({ defaultRole, defaultResumeName, defaultResumeText, onStart }: Props) {
  const { user } = useAuth();
  const u = user as any;

  const [difficulty, setDifficulty] = useState<Difficulty>('mid');
  const [targetRole, setTargetRole] = useState(defaultRole || 'Software Engineer');
  const [targetCompany, setTargetCompany] = useState('');
  const [rounds, setRounds] = useState<InterviewRound[]>([ROUND_TEMPLATES.behavioral]);
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [resumeName, setResumeName] = useState(defaultResumeName);
  const [resumeText, setResumeText] = useState(defaultResumeText);
  const [isParsing, setIsParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Build a rich resume context from profile data even without a PDF
  const buildProfileContext = (): string => {
    if (resumeText?.trim()) return resumeText;
    if (!u) return '';

    const lines: string[] = [];
    if (u.name) lines.push(`Name: ${u.name}`);
    if (u.branch) lines.push(`Degree: ${u.branch}, Year ${u.currentYear}`);
    if (u.cgpa) lines.push(`CGPA: ${u.cgpa}`);
    if (u.techSkills?.length) lines.push(`Skills: ${u.techSkills.join(', ')}`);
    if (u.projects?.length) {
      lines.push('Projects:');
      u.projects.forEach((p: any) => {
        lines.push(`  - ${p.title}: ${p.description || ''} ${p.tech ? `[${p.tech}]` : ''}`);
      });
    }
    if (u.internships?.length) {
      lines.push('Internships:');
      u.internships.forEach((i: any) => {
        lines.push(`  - ${i.role} at ${i.company} (${i.period}): ${i.description || ''}`);
      });
    }
    if (u.certifications?.length) {
      lines.push(`Certifications: ${u.certifications.map((c: any) => c.name).join(', ')}`);
    }
    if (u.leetcodeStats?.totalSolved) lines.push(`LeetCode: ${u.leetcodeStats.totalSolved} problems solved`);
    return lines.join('\n');
  };

  const profileContext = buildProfileContext();
  const hasResume = !!(resumeText?.trim());
  const hasProfileData = !hasResume && profileContext.trim().length > 50;
  const hasAnyContext = hasResume || hasProfileData;

  const totalMinutes = rounds.reduce((a, r) => a + r.durationMinutes, 0);
  const totalQuestions = rounds.reduce((a, r) => a + r.questionCount, 0);

  const addRound = (mode: InterviewMode) => {
    if (rounds.length >= 3) return;
    if (rounds.find(r => r.mode === mode)) return;
    setRounds(prev => [...prev, ROUND_TEMPLATES[mode]]);
  };

  const removeRound = (mode: InterviewMode) => setRounds(prev => prev.filter(r => r.mode !== mode));
  const moveRound = (idx: number, dir: -1 | 1) => {
    const next = [...rounds];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setRounds(next);
  };

  const handleResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    setIsParsing(true);
    try {
      const text = await extractTextFromLocalPDF(file);
      if (!text?.trim() || text.trim().length < 50) {
        alert('Could not extract readable text from this PDF. Make sure it is a text-based PDF (not a scanned image). Try copy-pasting your resume text instead.');
        return;
      }
      setResumeName(file.name);
      setResumeText(text);
    } catch (err) {
      alert('Failed to parse PDF. Make sure it is a valid, text-based PDF file.');
    } finally {
      setIsParsing(false);
      e.target.value = '';
    }
  };

  const handleStart = () => {
    if (rounds.length === 0) return;
    // Use uploaded resume first, then fall back to profile context
    const contextToUse = resumeText?.trim() || profileContext;
    onStart({ difficulty, targetRole, targetCompany, rounds, codeLanguage, resumeText: contextToUse, resumeName: resumeName || (hasProfileData ? 'Profile Data' : '') });
  };

  const availableModes = (Object.keys(ROUND_TEMPLATES) as InterviewMode[]).filter(m => !rounds.find(r => r.mode === m));

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Configure Your Interview</h1>
        <p className="text-sm text-slate-500">Build a session tailored to your target role and experience level.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <div className="lg:col-span-2 space-y-5">

          {/* Target role */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Target Role</p>
            <input
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-primary"
              placeholder="e.g. Software Engineer, Data Scientist"
            />
          </div>

          {/* Difficulty */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Difficulty Level</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.entries(DIFFICULTY_INFO) as [Difficulty, typeof DIFFICULTY_INFO.junior][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`rounded-xl border p-3 text-left transition-all ${difficulty === key ? 'border-primary bg-primary/10' : 'border-slate-200 hover:border-primary/40'}`}
                >
                  <p className="text-xs font-bold text-slate-800">{info.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{info.years}</p>
                  <p className="text-[10px] text-primary mt-1">{info.lcLevel}</p>
                  <p className="text-[9px] text-slate-500 mt-1 italic">{info.teaser}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Interview Rounds (max 3)</p>
            <div className="space-y-2">
              {rounds.map((r, idx) => (
                <div key={r.mode} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveRound(idx, -1)} disabled={idx === 0} className="text-slate-500 hover:text-slate-800 disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => moveRound(idx, 1)} disabled={idx === rounds.length - 1} className="text-slate-500 hover:text-slate-800 disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{r.label}</p>
                    <p className="text-[10px] text-slate-500">{r.questionCount} questions · ~{r.durationMinutes} min</p>
                  </div>
                  <button onClick={() => removeRound(r.mode)} className="text-slate-500 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            {availableModes.length > 0 && rounds.length < 3 && (
              <div className="flex flex-wrap gap-2">
                {availableModes.map(m => (
                  <button key={m} onClick={() => addRound(m)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors">
                    <Plus className="w-3 h-3" /> {ROUND_TEMPLATES[m].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Company + Language */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-widest">Target Company</p>
              <select value={targetCompany} onChange={e => setTargetCompany(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-primary">
                <option value="">Any / General</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-widest">Code Language</p>
              <select value={codeLanguage} onChange={e => setCodeLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-primary">
                {CODE_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Resume / Profile Context */}
          <div className={`bg-white border rounded-xl p-5 space-y-3 shadow-sm ${hasAnyContext ? 'border-green-200' : 'border-amber-200'}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 uppercase tracking-widest">Resume Context</p>
              {hasResume && <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> AI will use your resume</span>}
              {hasProfileData && !hasResume && <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> AI will use your profile</span>}
              {!hasAnyContext && <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Generic questions only</span>}
            </div>

            {!hasAnyContext && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                No resume or profile data found. Upload your resume PDF for personalized questions based on your actual projects and experience.
              </p>
            )}

            {hasProfileData && !hasResume && (
              <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                <p className="font-bold">Using your profile data to personalize questions:</p>
                <p className="text-blue-600 line-clamp-3 whitespace-pre-line">{profileContext.slice(0, 200)}...</p>
                <p className="text-blue-500 text-[10px]">Upload a resume PDF for even more specific questions.</p>
              </div>
            )}

            {hasResume ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-green-700 font-bold truncate">{resumeName}</p>
                    <p className="text-[10px] text-green-600">{resumeText.length} characters extracted — Gemini will reference your specific projects</p>
                  </div>
                  <button onClick={() => { setResumeName(''); setResumeText(''); }} className="text-[10px] text-red-500 hover:underline shrink-0">Remove</button>
                </div>
                {/* Show extracted text preview so student can verify */}
                <details className="text-[10px] text-slate-400 cursor-pointer">
                  <summary className="hover:text-slate-600 transition-colors">Preview extracted text</summary>
                  <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">
                    {resumeText.slice(0, 500)}...
                  </pre>
                </details>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={isParsing}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors">
                {isParsing ? 'Parsing PDF…' : <><Upload className="w-4 h-4" /> Upload Resume PDF (Recommended)</>}
              </button>
            )}
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleResume} />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 sticky top-6 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Your Interview Plan</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Role</span>
                <span className="text-slate-800 font-medium truncate max-w-[140px]">{targetRole}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Level</span>
                <span className="text-slate-800 font-medium">{DIFFICULTY_INFO[difficulty].label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Company</span>
                <span className="text-slate-800 font-medium">{targetCompany || 'General'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Questions</span>
                <span className="text-slate-800 font-medium">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Est. Duration</span>
                <span className="text-primary font-bold">~{totalMinutes} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Resume</span>
                <span className={hasResume ? 'text-green-600 font-bold' : hasProfileData ? 'text-blue-600 font-bold' : 'text-amber-500'}>
                  {hasResume ? '✓ Resume loaded' : hasProfileData ? '✓ Profile data' : '⚠ Not uploaded'}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1">
              {rounds.map((r, i) => (
                <div key={r.mode} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
                  {r.label} · {r.durationMinutes}m
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              disabled={rounds.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <Play className="w-4 h-4" /> Generate Interview Plan →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
