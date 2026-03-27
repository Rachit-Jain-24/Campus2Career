import { Suspense, lazy, useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { runCode, type CodeRunResult } from '../../lib/codeRunner';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

const STARTERS: Record<string, string> = {
  python: '# Write your solution here\ndef solution():\n    pass\n',
  javascript: '// Write your solution here\nfunction solution() {\n  \n}\n',
  java: 'class Solution {\n    public void solve() {\n        // Write your solution here\n    }\n}\n',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n    fmt.Println("Hello")\n}\n',
};

interface Props {
  language: string;
  onChange: (code: string) => void;
}

export function CodeSandbox({ language, onChange }: Props) {
  const [code, setCode] = useState(STARTERS[language] || STARTERS.python);
  const [output, setOutput] = useState<CodeRunResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleChange = (val: string | undefined) => {
    const v = val || '';
    setCode(v);
    onChange(v);
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    const result = await runCode(code, language);
    setOutput(result);
    setRunning(false);
  };

  const statusColor = output?.status === 'Accepted' || output?.status === 'Mock'
    ? 'text-green-400' : output?.stderr ? 'text-red-400' : 'text-[#8080a0]';

  return (
    <div className="space-y-3">
      {/* Editor */}
      <div className="rounded-xl overflow-hidden border border-[#2a2a38]">
        <Suspense fallback={
          <div className="h-[300px] bg-[#1e1e1e] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#4f8ef7] animate-spin" />
          </div>
        }>
          <MonacoEditor
            height="300px"
            language={language === 'cpp' ? 'cpp' : language}
            theme="vs-dark"
            value={code}
            onChange={handleChange}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </Suspense>
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={running}
        className="flex items-center gap-2 px-4 py-2 bg-[#4f8ef7] text-white text-xs font-bold rounded-lg hover:bg-[#3d7de6] disabled:opacity-50 transition-colors"
      >
        {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
        {running ? 'Running…' : 'Run Code'}
      </button>

      {/* Output */}
      {output && (
        <div className="bg-[#0a0a0f] border border-[#2a2a38] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
              {output.status}
            </span>
            {output.timeMs > 0 && (
              <span className="text-[10px] text-[#8080a0] font-mono">{output.timeMs.toFixed(0)}ms</span>
            )}
          </div>
          {output.isMock && (
            <p className="text-[10px] text-amber-400">⚠ Mock mode — set VITE_JUDGE0_API_KEY for real execution</p>
          )}
          {output.stdout && (
            <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">{output.stdout}</pre>
          )}
          {output.stderr && (
            <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">{output.stderr}</pre>
          )}
        </div>
      )}
    </div>
  );
}
