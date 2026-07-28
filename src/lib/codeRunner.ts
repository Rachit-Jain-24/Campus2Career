/**
 * Code Execution Engine for Interview Simulator
 *
 * Execution strategy:
 * 1. JavaScript / TypeScript  → browser sandbox (instant, no API)
 * 2. All other languages      → Python backend proxy → OneCompiler API
 * 3. If backend unavailable   → Judge0 CE public API (free, no key needed)
 * 4. If both fail             → smart mock
 */

export interface CodeRunResult {
  stdout: string;
  stderr: string;
  status: 'Accepted' | 'Error' | 'Timeout' | 'Mock';
  timeMs: number;
  isMock: boolean;
  executionTime?: number; // ms
  memoryUsed?: number;    // KB
  source?: 'backend' | 'judge0' | 'browser' | 'mock';
}

// ── OneCompiler language IDs (used by backend proxy) ─────────────────────────
const ONECOMPILER_LANGUAGES: Record<string, string> = {
  python:     'python',
  python3:    'python',
  java:       'java',
  cpp:        'cpp',
  c:          'c',
  go:         'go',
  rust:       'rust',
  ruby:       'ruby',
  php:        'php',
  csharp:     'csharp',
  kotlin:     'kotlin',
  swift:      'swift',
  scala:      'scala',
  r:          'r',
  bash:       'bash',
  sql:        'sqlite',
};

// ── File extensions for OneCompiler ──────────────────────────────────────────
const FILE_EXTENSIONS: Record<string, string> = {
  python: 'py', java: 'java', cpp: 'cpp', c: 'c', go: 'go',
  rust: 'rs', ruby: 'rb', php: 'php', csharp: 'cs', kotlin: 'kt',
  swift: 'swift', scala: 'scala', r: 'r', bash: 'sh', sql: 'sql',
};

// ── Judge0 CE language IDs (free public fallback) ────────────────────────────
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python:  71,
  java:    62,
  cpp:     54,
  c:       50,
  go:      60,
  rust:    73,
  ruby:    72,
  php:     68,
  csharp:  51,
  swift:   83,
  bash:    46,
  kotlin:  78,
  scala:   81,
  r:       80,
};

// ── 1. Backend proxy (OneCompiler via Python backend) ────────────────────────
async function executeViaBackend(
  code: string,
  language: string,
  stdin: string,
  startTime: number,
): Promise<CodeRunResult | null> {
  const oneCompilerLang = ONECOMPILER_LANGUAGES[language];
  if (!oneCompilerLang) return null;

  const backendUrl = (import.meta.env.VITE_AI_BACKEND_URL as string | undefined)
    || 'http://localhost:8000';

  try {
    const fileExt = FILE_EXTENSIONS[language] || 'txt';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(`${backendUrl}/api/run-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: oneCompilerLang,
        stdin: stdin || '',
        files: [{ name: `main.${fileExt}`, content: code }],
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      // 503/502/504 = backend down, try fallback
      if ([502, 503, 504].includes(response.status)) return null;
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      return {
        stdout: '',
        stderr: err?.detail || `Backend error ${response.status}`,
        status: 'Error',
        timeMs: Date.now() - startTime,
        isMock: false,
        source: 'backend',
      };
    }

    const result = await response.json();

    if (result.status === 'failed') {
      return {
        stdout: '',
        stderr: result.error || 'Execution failed',
        status: 'Error',
        timeMs: Date.now() - startTime,
        isMock: false,
        source: 'backend',
      };
    }

    if (result.exception) {
      return {
        stdout: result.stdout || '',
        stderr: result.exception,
        status: result.exception.toLowerCase().includes('timeout') ? 'Timeout' : 'Error',
        timeMs: Date.now() - startTime,
        isMock: false,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        source: 'backend',
      };
    }

    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      status: result.stderr ? 'Error' : 'Accepted',
      timeMs: Date.now() - startTime,
      isMock: false,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      source: 'backend',
    };
  } catch {
    // Network error or timeout — backend unreachable
    return null;
  }
}

// ── 2. Judge0 CE public API (free, no key, fallback) ─────────────────────────
async function executeViaJudge0(
  code: string,
  language: string,
  stdin: string,
  startTime: number,
): Promise<CodeRunResult | null> {
  const langId = JUDGE0_LANGUAGE_IDS[language];
  if (!langId) return null;

  // Try the free public Judge0 CE instance
  const JUDGE0_HOSTS = [
    'https://judge0-ce.p.rapidapi.com',
    'https://ce.judge0.com',
  ];

  const apiKey = (import.meta.env.VITE_JUDGE0_API_KEY as string | undefined) || '';

  for (const host of JUDGE0_HOSTS) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      // Add RapidAPI key only for the RapidAPI host
      if (host.includes('rapidapi') && apiKey) {
        headers['X-RapidAPI-Key'] = apiKey;
        headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(
        `${host}/submissions?base64_encoded=false&wait=true`,
        {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            language_id: langId,
            source_code: code,
            stdin: stdin || '',
          }),
        }
      );

      clearTimeout(timeout);

      if (!response.ok) continue; // try next host

      const result = await response.json();
      const isAccepted = result.status?.id === 3;
      const stderr = result.stderr || result.compile_output || (!isAccepted ? result.status?.description : '');

      return {
        stdout: result.stdout || '',
        stderr: stderr || '',
        status: isAccepted ? 'Accepted' : 'Error',
        timeMs: Date.now() - startTime,
        isMock: false,
        executionTime: result.time ? Math.round(parseFloat(result.time) * 1000) : undefined,
        memoryUsed: result.memory,
        source: 'judge0',
      };
    } catch {
      continue; // try next host
    }
  }

  return null; // both hosts failed
}

// ── 3. Browser sandbox (JS / TS only) ────────────────────────────────────────
function executeInBrowser(code: string, startTime: number): CodeRunResult {
  try {
    const logs: string[] = [];
    const errors: string[] = [];

    const sandbox = {
      console: {
        log:  (...args: unknown[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        error:(...args: unknown[]) => errors.push(args.map(a => String(a)).join(' ')),
        warn: (...args: unknown[]) => logs.push('WARNING: ' + args.map(a => String(a)).join(' ')),
        info: (...args: unknown[]) => logs.push(args.map(a => String(a)).join(' ')),
      },
      Math, JSON, Array, Object, String, Number, Boolean, Date, RegExp,
      Error, TypeError, RangeError, SyntaxError, parseInt, parseFloat, isNaN, isFinite,
    };

    const fn = new Function(`
      return (function() {
        'use strict';
        const console = this.console;
        const Math = this.Math; const JSON = this.JSON;
        const Array = this.Array; const Object = this.Object;
        const String = this.String; const Number = this.Number;
        const Boolean = this.Boolean; const Date = this.Date;
        const parseInt = this.parseInt; const parseFloat = this.parseFloat;
        try { ${code} } catch (err) { console.error(err.message || String(err)); }
      })
    `)();

    fn.call(sandbox);

    return {
      stdout: logs.join('\n'),
      stderr: errors.join('\n'),
      status: errors.length > 0 ? 'Error' : 'Accepted',
      timeMs: Date.now() - startTime,
      isMock: false,
      source: 'browser',
    };
  } catch (err) {
    return {
      stdout: '',
      stderr: err instanceof Error ? err.message : 'Execution error',
      status: 'Error',
      timeMs: Date.now() - startTime,
      isMock: false,
      source: 'browser',
    };
  }
}

// ── 4. Smart mock (last resort) ───────────────────────────────────────────────
function createSmartMock(code: string, language: string, startTime: number): CodeRunResult {
  const lines = code.split('\n').filter(l => l.trim());

  // Try to extract simple print/cout/System.out outputs for a better mock
  const outputs: string[] = [];

  // Python: print("...")
  const pyPrint = /print\s*\(\s*["'](.+?)["']\s*\)/g;
  // Java/Kotlin: System.out.println("...")
  const javaPrint = /System\.out\.println\s*\(\s*["'](.+?)["']\s*\)/g;
  // C++: cout << "..."
  const cppCout = /cout\s*<<\s*["'](.+?)["']/g;
  // Go: fmt.Println("...")
  const goPrint = /fmt\.Println\s*\(\s*["'](.+?)["']\s*\)/g;
  // Rust: println!("...")
  const rustPrint = /println!\s*\(\s*["'](.+?)["']/g;

  for (const regex of [pyPrint, javaPrint, cppCout, goPrint, rustPrint]) {
    let m;
    while ((m = regex.exec(code)) !== null) outputs.push(m[1]);
  }

  if (outputs.length > 0) {
    return {
      stdout: outputs.join('\n'),
      stderr: '',
      status: 'Accepted',
      timeMs: Date.now() - startTime,
      isMock: true,
      source: 'mock',
    };
  }

  return {
    stdout: `[${language.toUpperCase()} · ${lines.length} lines · syntax looks valid]\n\nCode execution service is unavailable right now.\nYour code will be evaluated based on your explanation.`,
    stderr: '',
    status: 'Mock',
    timeMs: Date.now() - startTime,
    isMock: true,
    source: 'mock',
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function runCode(
  code: string,
  language: string,
  stdin = '',
): Promise<CodeRunResult> {
  const startTime = Date.now();
  const lang = language.toLowerCase();

  // JS/TS: instant browser execution
  if (lang === 'javascript' || lang === 'typescript') {
    return executeInBrowser(code, startTime);
  }

  // Try backend proxy (OneCompiler) first
  const backendResult = await executeViaBackend(code, lang, stdin, startTime);
  if (backendResult !== null) return backendResult;

  // Backend unavailable — try Judge0 CE public API
  const judge0Result = await executeViaJudge0(code, lang, stdin, startTime);
  if (judge0Result !== null) return judge0Result;

  // Both failed → smart mock
  return createSmartMock(code, language, startTime);
}

export function getSupportedLanguages(): string[] {
  return [
    'python', 'javascript', 'typescript', 'java', 'cpp', 'c',
    'go', 'rust', 'ruby', 'php', 'csharp', 'kotlin', 'swift',
    'scala', 'r', 'bash', 'sql',
  ];
}
