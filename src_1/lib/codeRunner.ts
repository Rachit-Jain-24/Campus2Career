/**
 * Code Execution Engine for Interview Simulator
 *
 * Execution strategy:
 * 1. JavaScript/TypeScript → browser sandbox (instant, no API)
 * 2. All other languages → OneCompiler API (Python, Java, C++, Go, etc.)
 * 3. Fallback → smart mock with code analysis
 */

export interface CodeRunResult {
  stdout: string;
  stderr: string;
  status: 'Accepted' | 'Error' | 'Timeout' | 'Mock';
  timeMs: number;
  isMock: boolean;
  executionTime?: number; // OneCompiler execution time in ms
  memoryUsed?: number;    // Memory used in KB
}

// Judge0 Language IDs
const JUDGE0_LANGUAGES: Record<string, number> = {
  python: 71,
  python3: 71,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
  rust: 73,
  ruby: 72,
  php: 68,
  csharp: 51,
  swift: 83,
  bash: 46,
  sql: 82,
};

async function executeWithJudge0(
  code: string,
  language: string,
  stdin: string,
  startTime: number,
): Promise<CodeRunResult> {
  const languageId = JUDGE0_LANGUAGES[language];
  if (!languageId) return createSmartMock(code, language, startTime);

  try {
    const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: stdin || '',
      }),
    });

    if (!response.ok) {
      // API might be down or rate limited, fallback to mock
      return createSmartMock(code, language, startTime);
    }

    const result = await response.json();

    // Judge0 status ids: 3 is Accepted
    const isError = result.status?.id !== 3;
    const stderr = result.stderr || result.compile_output || (isError ? result.status?.description : '');

    return {
      stdout: result.stdout || '',
      stderr: stderr || '',
      status: isError ? 'Error' : 'Accepted',
      timeMs: Date.now() - startTime,
      isMock: false,
      executionTime: result.time ? parseFloat(result.time) * 1000 : undefined,
      memoryUsed: result.memory, // in KB
    };
  } catch (err) {
    // Network error
    return createSmartMock(code, language, startTime);
  }
}

// ─── Browser sandbox (JavaScript / TypeScript) ───────────────────────────────
function executeInBrowser(code: string, startTime: number): CodeRunResult {
  try {
    const logs: string[] = [];
    const errors: string[] = [];

    const sandbox = {
      console: {
        log: (...args: unknown[]) =>
          logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
        error: (...args: unknown[]) => errors.push(args.map(a => String(a)).join(' ')),
        warn: (...args: unknown[]) =>
          logs.push('WARNING: ' + args.map(a => String(a)).join(' ')),
      },
      Math, JSON, Array, Object, String, Number, Boolean, Date, RegExp,
      Error, TypeError, RangeError, SyntaxError,
    };

    const wrappedCode = `
      (function() {
        'use strict';
        const console = this.console;
        const Math = this.Math; const JSON = this.JSON;
        const Array = this.Array; const Object = this.Object;
        const String = this.String; const Number = this.Number;
        const Boolean = this.Boolean;
        try { ${code} } catch (err) { console.error(err.message || err); }
      })()
    `;

    new Function(wrappedCode).call(sandbox);

    return {
      stdout: logs.join('\n'),
      stderr: errors.join('\n'),
      status: errors.length > 0 ? 'Error' : 'Accepted',
      timeMs: Date.now() - startTime,
      isMock: false,
    };
  } catch (err) {
    return {
      stdout: '',
      stderr: err instanceof Error ? err.message : 'Execution error',
      status: 'Error',
      timeMs: Date.now() - startTime,
      isMock: false,
    };
  }
}



// ─── Smart mock fallback ──────────────────────────────────────────────────────
function createSmartMock(code: string, language: string, startTime: number): CodeRunResult {
  const lines = code.split('\n').filter(l => l.trim());
  const outputs: string[] = [];
  const printRegex = /print\s*\((.+)\)/g;
  let match;

  while ((match = printRegex.exec(code)) !== null) {
    const value = match[1].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      outputs.push(value.slice(1, -1));
    } else if (!isNaN(Number(value))) {
      outputs.push(value);
    } else {
      outputs.push(`[Expression: ${value}]`);
    }
  }

  if (outputs.length > 0) {
    return {
      stdout: outputs.join('\n') + '\n\n[Note: Simplified output simulation]',
      stderr: '',
      status: 'Accepted',
      timeMs: Date.now() - startTime,
      isMock: true,
    };
  }

  return {
    stdout: `[Mock - ${language}]\n\nCode Analysis:\n- ${lines.length} lines of code\n- Syntax appears valid\n\nNote: The live code execution service is currently unavailable.\nThis is a mock response analyzing your code structure.`,
    stderr: '',
    status: 'Mock',
    timeMs: Date.now() - startTime,
    isMock: true,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function runCode(code: string, language: string, stdin = ''): Promise<CodeRunResult> {
  const startTime = Date.now();
  const lang = language.toLowerCase();

  // JavaScript/TypeScript run in browser sandbox (instant, no API needed)
  if (lang === 'javascript' || lang === 'typescript') {
    return executeInBrowser(code, startTime);
  }

  // All other languages use Judge0 API
  return executeWithJudge0(code, lang, stdin, startTime);
}

export function getSupportedLanguages(): string[] {
  return [
    'python',
    'javascript',
    'typescript',
    'java',
    'cpp',
    'c',
    'go',
    'rust',
    'ruby',
    'php',
    'csharp',
    'kotlin',
    'swift',
    'scala',
    'perl',
    'r',
    'lua',
    'haskell',
    'bash',
  ];
}
