import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ArrowLeft, Brain, Zap } from 'lucide-react';

interface Question {
    id: number;
    text: string;
    hint?: string;
    options: { label: string; domains: string[] }[];
}

const QUESTIONS: Question[] = [
    {
        id: 1,
        text: 'What kind of outcome excites you most from your work?',
        hint: 'Think about what you\'d be proud of showing someone.',
        options: [
            { label: '🌐 A live website or app people use', domains: ['Full-Stack Developer', 'UI / UX Designer'] },
            { label: '🤖 An AI model that predicts or learns', domains: ['AI / ML Engineer', 'Data Engineer'] },
            { label: '⚙️ A system that never goes down', domains: ['Cloud & DevOps', 'QA / Automation'] },
            { label: '🛡️ Catching hackers and securing data', domains: ['Cybersecurity'] },
            { label: '💡 Designing strategy for a product', domains: ['Product Manager'] },
            { label: '⛓️ Building on blockchain / decentralized systems', domains: ['Blockchain Developer'] },
            { label: '🥽 Creating AR/VR or physical robots', domains: ['AR / VR Developer', 'Drone / Embedded Systems'] },
        ],
    },
    {
        id: 2,
        text: 'Which school subject did you like or were naturally good at?',
        options: [
            { label: '📐 Mathematics & Statistics', domains: ['AI / ML Engineer', 'Data Engineer', 'Blockchain Developer'] },
            { label: '🖥️ Computer Science (Coding)', domains: ['Software Engineer', 'Full-Stack Developer', 'QA / Automation'] },
            { label: '🎨 Art / Design', domains: ['UI / UX Designer'] },
            { label: '⚡ Physics / Electronics', domains: ['Drone / Embedded Systems', 'AR / VR Developer'] },
            { label: '📊 Economics / Business', domains: ['Product Manager'] },
            { label: '🔐 Logic & Puzzles', domains: ['Cybersecurity', 'Software Engineer'] },
        ],
    },
    {
        id: 3,
        text: 'How do you prefer to spend a free Saturday learning something new?',
        options: [
            { label: '🎮 Building a game or mini-app', domains: ['Full-Stack Developer', 'AR / VR Developer'] },
            { label: '📈 Analyzing a data set or chart', domains: ['Data Engineer', 'AI / ML Engineer'] },
            { label: '📡 Setting up a server or automating tasks', domains: ['Cloud & DevOps', 'QA / Automation'] },
            { label: '🔍 Finding bugs or exploits', domains: ['Cybersecurity'] },
            { label: '📝 Writing ideas for a startup / product', domains: ['Product Manager'] },
            { label: '🤖 Soldering, coding hardware, flying a drone', domains: ['Drone / Embedded Systems'] },
            { label: '✏️ Sketching UI wireframes', domains: ['UI / UX Designer'] },
        ],
    },
    {
        id: 4,
        text: 'Which of these statements best describes you?',
        options: [
            { label: '💬 "I want my code to help millions of users"', domains: ['Full-Stack Developer', 'Software Engineer'] },
            { label: '🧠 "I want machines to think and be smarter"', domains: ['AI / ML Engineer'] },
            { label: '☁️ "I want the internet to never go down"', domains: ['Cloud & DevOps'] },
            { label: '🛡️ "I want to protect people online"', domains: ['Cybersecurity'] },
            { label: '📱 "I want to build the next great product"', domains: ['Product Manager', 'UI / UX Designer'] },
            { label: '💹 "I want to change how money and trust works"', domains: ['Blockchain Developer'] },
            { label: '🚁 "I want to code things that move in the real world"', domains: ['Drone / Embedded Systems', 'AR / VR Developer'] },
        ],
    },
    {
        id: 5,
        text: 'Which of these tools or words sounds most interesting to you right now?',
        options: [
            { label: 'React, Node.js, APIs', domains: ['Full-Stack Developer'] },
            { label: 'PyTorch, Neural Networks, LLMs', domains: ['AI / ML Engineer'] },
            { label: 'Kafka, Spark, Data Pipelines', domains: ['Data Engineer'] },
            { label: 'Kubernetes, Terraform, CI/CD', domains: ['Cloud & DevOps'] },
            { label: 'Kali Linux, CVEs, Exploit kits', domains: ['Cybersecurity'] },
            { label: 'Solidity, Smart Contracts, DeFi', domains: ['Blockchain Developer'] },
            { label: 'Unity, ARKit, Spatial Computing', domains: ['AR / VR Developer'] },
            { label: 'ROS, PX4, Embedded C, RTOS', domains: ['Drone / Embedded Systems'] },
            { label: 'Selenium, QA Automation, Test Suites', domains: ['QA / Automation'] },
            { label: 'Figma, Design Systems, User Flows', domains: ['UI / UX Designer'] },
            { label: 'PRDs, OKRs, Product Strategy', domains: ['Product Manager'] },
        ],
    },
];

interface PsychometricAssessmentProps {
    onComplete: (recommendedDomain: string) => void;
    onCancel: () => void;
}

export function PsychometricAssessment({ onComplete, onCancel }: PsychometricAssessmentProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [scores, setScores] = useState<Record<string, number>>({});

    const handleAnswer = (option: { label: string; domains: string[] }) => {
        const newScores = { ...scores };
        option.domains.forEach(domain => {
            newScores[domain] = (newScores[domain] || 0) + 1;
        });
        setScores(newScores);

        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Find highest scoring domain
            const recommended = Object.entries(newScores).reduce(
                (best, curr) => curr[1] > best[1] ? curr : best,
                ['Software Engineer', 0]
            )[0];
            onComplete(recommended);
        }
    };

    const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
    const currentQuestion = QUESTIONS[currentStep];

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-100">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeInOut' }}
                />
            </div>

            <div className="p-8 md:p-10 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> Question {currentStep + 1} of {QUESTIONS.length}
                    </div>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" /> Browse All
                    </button>
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 leading-snug">{currentQuestion.text}</h2>
                            {currentQuestion.hint && (
                                <p className="text-sm text-slate-400 font-medium">{currentQuestion.hint}</p>
                            )}
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-2.5">
                            {currentQuestion.options.map((option, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.015 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => handleAnswer(option)}
                                    className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-primary/5 border border-slate-200 hover:border-primary/40 rounded-2xl text-sm font-bold text-slate-700 transition-all flex items-center gap-3"
                                >
                                    <Check className="w-4 h-4 text-slate-300 shrink-0" />
                                    {option.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Footer hint */}
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
                    <Brain className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-xs text-slate-500">
                        Our interest-mapping algorithm scores <strong>12 career domains</strong> in real time based on your answers.
                        No right or wrong — just pick what feels most natural.
                    </p>
                </div>

                {/* Step dots */}
                <div className="flex justify-center gap-2">
                    {QUESTIONS.map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentStep ? 'bg-primary w-4' : i < currentStep ? 'bg-primary/40' : 'bg-slate-200'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
