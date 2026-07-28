import { Suspense, lazy, useState, useEffect } from 'react';
import { Play, Loader2, ChevronDown, Code2 } from 'lucide-react';
import { runCode, type CodeRunResult } from '../../lib/codeRunner';
import { CODE_LANGUAGES, CODE_LANGUAGE_LABELS } from '../../lib/interviewEngine';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

// ── Starter templates per language ───────────────────────────────────────────
const STARTERS: Record<string, string> = {
  python: `# Write your solution here
def solution():
    pass

# Test your solution
print(solution())
`,
  javascript: `// Write your solution here
function solution() {
  
}

// Test your solution
console.log(solution());
`,
  typescript: `// Write your solution here
function solution(): void {
  
}

// Test your solution
solution();
`,
  java: `class Solution {
    public static void main(String[] args) {
        // Write your solution here
        System.out.println("Hello");
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}
`,
  c: `#include <stdio.h>

int main() {
    // Write your solution here
    printf("Hello\\n");
    return 0;
}
`,
  go: `package main

import "fmt"

func main() {
    // Write your solution here
    fmt.Println("Hello")
}
`,
  rust: `fn main() {
    // Write your solution here
    println!("Hello");
}
`,
  kotlin: `fun main() {
    // Write your solution here
    println("Hello")
}
`,
  swift: `import Foundation

// Write your solution here
print("Hello")
`,
  csharp: `using System;

class Solution {
    static void Main(string[] args) {
        // Write your solution here
        Console.WriteLine("Hello");
    }
}
`,
  php: `<?php
// Write your solution here
echo "Hello\\n";
?>
`,
  ruby: `# Write your solution here
def solution
  
end

puts solution
`,
  scala: `object Solution {
  def main(args: Array[String]): Unit = {
    // Write your solution here
    println("Hello")
  }
}
`,
  r: `# Write your solution here
solution <- function() {
  
}

print(solution())
`,
  bash: `#!/bin/bash
# Write your solution here
echo "Hello"
`,
  sql: `-- Write your SQL query here
SELECT *
FROM table_name
WHERE condition;
`,
};

// ── Monaco language IDs (Monaco uses different names for some) ────────────────
const MONACO_LANG: Record<string, string> = {
  python:     'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java:       'java',
  cpp:        'cpp',
  c:          'c',
  go:         'go',
  rust:       'rust',
  kotlin:     'kotlin',
  swift:      'swift',
  csharp:     'csharp',
  php:        'php',
  ruby:       'ruby',
  scala:      'scala',
  r:          'r',
  bash:       'shell',
  sql:        'sql',
};

interface Props {
  language: string;           // initial language from session config
  onChange: (code: string) => void;
  onOutputChange?: (output: string) => void;
}

export function CodeSandbox({ language: initialLanguage, onChange, onOutputChange }: Props) {
  const [selectedLang, setSelectedLang] = useState(initialLanguage || 'python');
  const [code, setCode] = useState(STARTERS[initialLanguage] || STARTERS.python);
  const [output, setOutput] = useState<CodeRunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);

  // When language changes: swap starter template + clear output
  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    const starter = STARTERS[lang] || `// Write your ${CODE_LANGUAGE_LABELS[lang] ?? lang} solution here\n`;
    setCode(starter);
    onChange(starter);
    setOutput(null);
  };

  // Keep parent in sync on mount
  useEffect(() => {
    onChange(code);
  }, []);

  const handleCodeChange = (val: string | undefined) => {
    const v = val || '';
    setCode(v);
    onChange(v);
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    setLoadingMsg('Running…');
    const result = await runCode(code, selectedLang, stdin);
    setLoadingMsg('');
    setOutput(result);
    setRunning(false);
    if (onOutputChange) {
      const combined = [result.stdout, result.stderr].filter(Boolean).join('\n');
      onOutputChange(combined);
    }
  };

  const statusColor =
    output?.status === 'Accepted' ? 'text-green-400' :
    output?.status === 'Mock'     ? 'text-amber-400' :
    output?.status === 'Timeout'  ? 'text-orange-400' :
    output?.stderr                ? 'text-red-400'   : 'text-[#8080a0]';

  const monacoLang = MONACO_LANG[selectedLang] || selectedLang;

  return (
    <div className="space-y-2">

      {/* ── Language selector bar ── */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-[#4f8ef7]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8080a0]">Language</span>
        </div>
        <div className="relative">
          <select
            value={selectedLang}
            onChange={e => handleLanguageChange(e.target.value)}
            className="appearance-none bg-[#1a1a2e] border border-[#2a2a38] text-white text-xs font-bold rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-[#4f8ef7] cursor-pointer hover:border-[#4f8ef7]/60 transition-colors"
          >
            {CODE_LANGUAGES.map(lang => (
              <option key={lang} value={lang}>
                {CODE_LANGUAGE_LABELS[lang] ?? lang}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8080a0] pointer-events-none" />
        </div>
      </div>

      {/* ── Monaco Editor ── */}
      <div className="rounded-xl overflow-hidden border border-[#2a2a38]">
        <Suspense fallback={
          <div className="h-[320px] bg-[#1e1e1e] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#4f8ef7] animate-spin" />
          </div>
        }>
          <MonacoEditor
            key={selectedLang}   /* remount when language changes so Monaco re-initialises */
            height="320px"
            language={monacoLang}
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              tabSize: selectedLang === 'python' ? 4 : 2,
              insertSpaces: true,
            }}
          />
        </Suspense>
      </div>

      {/* ── STDIN toggle ── */}
      <button
        onClick={() => setShowStdin(v => !v)}
        className="text-[10px] text-[#8080a0] hover:text-[#4f8ef7] transition-colors font-bold uppercase tracking-widest"
      >
        {showStdin ? '▲ Hide' : '▼ Add'} stdin input (optional)
      </button>
      {showStdin && (
        <textarea
          value={stdin}
          onChange={e => setStdin(e.target.value)}
          placeholder="Enter stdin values here (one per line)…"
          rows={3}
          className="w-full bg-[#0a0a0f] border border-[#2a2a38] rounded-xl p-3 text-xs text-[#c0c0d0] font-mono placeholder-[#4a4a5a] resize-none focus:outline-none focus:border-[#4f8ef7] transition-colors"
        />
      )}

      {/* ── Run button ── */}
      <button
        onClick={handleRun}
        disabled={running}
        className="flex items-center gap-2 px-5 py-2 bg-[#4f8ef7] text-white text-xs font-bold rounded-lg hover:bg-[#3d7de6] disabled:opacity-50 transition-colors"
      >
        {running
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{loadingMsg || 'Running…'}</>
          : <><Play className="w-3.5 h-3.5" />Run {CODE_LANGUAGE_LABELS[selectedLang] ?? selectedLang}</>
        }
      </button>

      {/* ── Output panel ── */}
      {output && (
        <div className="bg-[#0a0a0f] border border-[#2a2a38] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
              {output.status === 'Accepted' ? '✓ Accepted' :
               output.status === 'Error'    ? '✗ Error' :
               output.status === 'Timeout'  ? '⏱ Timeout' :
               output.status === 'Mock'     ? '⚠ Mock' :
               output.status}
            </span>
            <div className="flex items-center gap-3">
              {output.executionTime !== undefined && (
                <span className="text-[10px] text-[#8080a0] font-mono">exec: {output.executionTime}ms</span>
              )}
              {output.memoryUsed !== undefined && (
                <span className="text-[10px] text-[#8080a0] font-mono">mem: {output.memoryUsed}KB</span>
              )}
              {output.timeMs > 0 && output.executionTime === undefined && (
                <span className="text-[10px] text-[#8080a0] font-mono">{output.timeMs.toFixed(0)}ms</span>
              )}
            </div>
          </div>

          {output.isMock && (
            <p className="text-[10px] text-amber-400">
              ⚠ Both execution services unavailable — your code will be evaluated on your explanation
            </p>
          )}

          {!output.isMock && output.source && (
            <p className="text-[10px] text-[#4a4a6a]">
              via {output.source === 'backend' ? 'OneCompiler' : output.source === 'judge0' ? 'Judge0 CE' : output.source}
            </p>
          )}

          {output.stdout && (
            <div>
              <p className="text-[10px] text-[#8080a0] font-bold uppercase tracking-widest mb-1">Output</p>
              <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap bg-black/30 p-3 rounded-lg leading-relaxed">
                {output.stdout}
              </pre>
            </div>
          )}

          {output.stderr && (
            <div>
              <p className="text-[10px] text-[#8080a0] font-bold uppercase tracking-widest mb-1">Error</p>
              <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap bg-black/30 p-3 rounded-lg leading-relaxed">
                {output.stderr}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
