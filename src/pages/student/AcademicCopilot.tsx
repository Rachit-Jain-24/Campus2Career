
import React, { useState } from 'react';
import { 
    BookOpen, 
    Upload, 
    FileText, 
    Zap, 
    CheckCircle2, 
    BrainCircuit, 
    Calendar, 
    ArrowRight,
    Loader2,
    Plus,
    Target
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { copilotEngine } from '../../lib/ai/copilotEngine';
import type { Syllabus, AcademicModule, AcademicNote, AcademicQuiz } from '../../types/copilot';
import { useAuth } from '../../contexts/AuthContext';

const AcademicCopilot: React.FC = () => {
    const { user } = useAuth();
    const [step, setStep] = useState<'upload' | 'dashboard' | 'learning'>('upload');
    const [rawText, setRawText] = useState('');
    const [courseName, setCourseName] = useState('');
    const [semester, setSemester] = useState(1);
    const [isParsing, setIsParsing] = useState(false);
    
    const [activeSyllabus, setActiveSyllabus] = useState<Syllabus | null>(null);
    const [selectedModule, setSelectedModule] = useState<AcademicModule | null>(null);
    const [activeNote, setActiveNote] = useState<AcademicNote | null>(null);
    const [activeQuiz, setActiveQuiz] = useState<AcademicQuiz | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleParseSyllabus = async () => {
        if (!rawText || !courseName) return;
        setIsParsing(true);
        try {
            const syllabus = await copilotEngine.parseSyllabus(rawText, courseName, semester);
            syllabus.studentId = user?.uid || 'guest';
            setActiveSyllabus(syllabus);
            setStep('dashboard');
        } catch (error) {
            console.error("Failed to parse syllabus:", error);
        } finally {
            setIsParsing(false);
        }
    };

    const handleGenerateNotes = async (module: AcademicModule) => {
        if (!activeSyllabus) return;
        setIsGenerating(true);
        try {
            const notes = await copilotEngine.generateNotes(activeSyllabus, module);
            setActiveNote(notes);
            setSelectedModule(module);
            setStep('learning');
        } catch (error) {
            console.error("Failed to generate notes:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateQuiz = async (module: AcademicModule) => {
        if (!activeSyllabus) return;
        setIsGenerating(true);
        try {
            const quiz = await copilotEngine.generateQuiz(activeSyllabus, [module]);
            setActiveQuiz(quiz);
            setSelectedModule(module);
            setStep('learning');
        } catch (error) {
            console.error("Failed to generate quiz:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        AI Academic Copilot
                    </h1>
                    <p className="text-muted-foreground">Your personalized academic intelligence engine.</p>
                </div>
                {activeSyllabus && (
                    <Button variant="outline" onClick={() => setStep('upload')} size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Modify Syllabus
                    </Button>
                )}
            </div>

            {/* Step 1: Syllabus Upload / Input */}
            {step === 'upload' && (
                <Card className="p-8 border-2 border-dashed border-primary/20 bg-primary/5">
                    <div className="max-w-2xl mx-auto space-y-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Initialize Your Learning Path</h2>
                            <p className="text-muted-foreground text-sm">
                                Paste your course syllabus text below. Our AI will analyze topics, modules, and structure your learning plan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Course Name</label>
                                <Input 
                                    placeholder="e.g. Data Structures & Algorithms" 
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Semester</label>
                                <Input 
                                    type="number"
                                    value={semester}
                                    onChange={(e) => setSemester(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Syllabus Text</label>
                            <textarea 
                                className="w-full h-48 p-4 rounded-xl border bg-card resize-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Paste modules, topics, and objectives here..."
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                            />
                        </div>

                        <Button 
                            className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                            onClick={handleParseSyllabus}
                            disabled={isParsing || !rawText || !courseName}
                        >
                            {isParsing ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                                    Analyzing Syllabus...
                                </>
                            ) : (
                                <>
                                    <BrainCircuit className="h-5 w-5 mr-3" />
                                    Launch AI Copilot
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 2: Dashboard */}
            {step === 'dashboard' && activeSyllabus && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Module List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                Syllabus Modules
                            </h3>
                            <Badge variant="default">{activeSyllabus.modules.length} Modules Found</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeSyllabus.modules.map((msg) => (
                                <Card key={msg.id} className="p-5 hover:border-primary/40 transition-all group flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                                {msg.name}
                                            </h4>
                                            {msg.weightage && (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{msg.weightage}%</Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {msg.topics.slice(0, 3).map((topic, i) => (
                                                <span key={i} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-medium">
                                                    {topic}
                                                </span>
                                            ))}
                                            {msg.topics.length > 3 && (
                                                <span className="text-[10px] text-muted-foreground px-1 font-medium">+{msg.topics.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="pt-5 flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="flex-1 h-9 rounded-lg"
                                            onClick={() => handleGenerateNotes(msg)}
                                        >
                                            <FileText className="h-3.5 w-3.5 mr-2" />
                                            Notes
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="flex-1 h-9 rounded-lg"
                                            onClick={() => handleGenerateQuiz(msg)}
                                        >
                                            <Zap className="h-3.5 w-3.5 mr-2" />
                                            Quiz
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Stats & Tools */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-gradient-to-br from-indigo-600 to-primary text-white border-0">
                            <div className="space-y-4">
                                <div className="p-2 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Target className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Revision Plan</h4>
                                    <p className="text-white/80 text-sm">Get a daily schedule mapped to your exam date.</p>
                                </div>
                                <Button className="w-full bg-white text-primary hover:bg-white/90">
                                    Generate Schedule
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6 space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Academic Stats
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Topics Mastered</span>
                                    <span className="font-bold">0%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-0" />
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Notes Generated</span>
                                    <span className="font-bold">0</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Quizzes Taken</span>
                                    <span className="font-bold">0</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Step 3: Learning View (Notes/Quiz) */}
            {step === 'learning' && selectedModule && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => setStep('dashboard')}>
                            <ArrowRight className="h-5 w-5 rotate-180" />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold">{selectedModule.name}</h2>
                            <p className="text-sm text-muted-foreground">Learning Resources</p>
                        </div>
                    </div>

                    {isGenerating ? (
                        <div className="h-96 flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="relative">
                                <div className="h-20 w-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <BrainCircuit className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl">AI is crafting your resources</h3>
                                <p className="text-muted-foreground">Gathering concepts, examples, and logic...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Navigation Sidebar for Learning */}
                            <div className="space-y-2">
                                <button 
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeNote ? 'bg-primary text-white' : 'hover:bg-secondary'}`}
                                    onClick={() => handleGenerateNotes(selectedModule)}
                                >
                                    <FileText className="h-4 w-4" />
                                    Module Notes
                                </button>
                                <button 
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeQuiz ? 'bg-primary text-white' : 'hover:bg-secondary'}`}
                                    onClick={() => handleGenerateQuiz(selectedModule)}
                                >
                                    <Zap className="h-4 w-4" />
                                    Practice Quiz
                                </button>
                            </div>

                            {/* Main Content Area */}
                            <div className="lg:col-span-3">
                                {activeNote && (
                                    <Card className="p-8 prose prose-slate max-w-none prose-h2:text-primary prose-h3:text-primary/80">
                                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                                            <h3 className="text-2xl font-bold m-0 text-primary">{activeNote.title}</h3>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">Download PDF</Button>
                                            </div>
                                        </div>
                                        <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {activeNote.content}
                                        </div>
                                        <div className="mt-12 p-6 bg-secondary/50 rounded-2xl">
                                            <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Key Takeaways</h4>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0">
                                                {(activeNote.keyTakeaways ?? []).map((point, i) => (
                                                    <li key={i} className="flex gap-2 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Card>
                                )}

                                {activeQuiz && (
                                    <Card className="p-8 space-y-8">
                                        <div className="space-y-2 border-b pb-6">
                                            <h3 className="text-2xl font-bold text-primary">{activeQuiz.title}</h3>
                                            <p className="text-muted-foreground">Test your understanding of {selectedModule.name}.</p>
                                        </div>
                                        
                                        <div className="space-y-12">
                                            {activeQuiz.questions.map((q, idx) => (
                                                <div key={q.id} className="space-y-6">
                                                    <div className="flex gap-4">
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                            {idx + 1}
                                                        </div>
                                                        <p className="text-lg font-medium">{q.question}</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                                                        {q.options.map((opt, i) => (
                                                            <button 
                                                                key={i}
                                                                className="text-left px-5 py-4 rounded-xl border border-secondary bg-card hover:border-primary hover:bg-primary/5 transition-all outline-none"
                                                            >
                                                                <span className="text-xs font-bold text-muted-foreground mr-3">{String.fromCharCode(65 + i)}.</span>
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="pt-8 flex justify-end">
                                            <Button size="lg" className="px-12 font-bold">Submit Quiz</Button>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AcademicCopilot;
