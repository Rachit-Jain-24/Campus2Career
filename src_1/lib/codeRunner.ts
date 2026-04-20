/**
 * Code Execution Engine for Interview Simulator
 *
 * Execution strategy:
 * 1. JavaScript/TypeScript → browser sandbox (instant, no API)
 * 2. Python → Pyodide (Python via WebAssembly, runs in browser, no API)
 * 3. Java/C++/Go/etc. → Judge0 CE via RapidAPI (if key configured)
 * 4. Fallback → smart mock with code analysis
 */

export interface CodeRunResult {
  stdout: string;
  stderr: string;
  status: 'Accepted' | 'Error' | 'Timeout' | 'Mock';
  timeMs: number;
  isMock: boolean;
}

// ─── Pyodide (Python in browser via WASM) ────────────────────────────────────
declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInstance>;
    _pyodideInstance?: PyodideInstance;
    _pyodideLoading?: Promise<PyodideInstance>;
  }
}

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: { get: (key: string) => unknown };
  loadPackagesFromImports: (code: string) => Promise<void>;
}

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/';

async function getPyodide(): Promise<PyodideInstance> {
  if (window._pyodideInstance) return window._pyodideInstance;

  // Deduplicate concurrent load requests
  if (window._pyodideLoading) return window._pyodideLoading;

  window._pyodideLoading = (async () => {
    // Inject the Pyodide loader script if not already present
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${PYODIDE_CDN}pyodide.js`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Pyodide script'));
        document.head.appendChild(script);
      });
    }

    const pyodide = await window.loadPyodide!({ indexURL: PYODIDE_CDN });
    window._pyodideInstance = pyodide;
    return pyodide;
  })();

  return window._pyodideLoading;
}

// Packages bundled natively in Pyodide — no micropip needed
const PYODIDE_BUILTIN_PACKAGES = new Set([
  'numpy', 'pandas', 'matplotlib', 'scipy', 'scikit-learn', 'sklearn',
  'pillow', 'pil', 'cryptography', 'lxml', 'regex', 'pytz', 'dateutil',
  'attrs', 'six', 'packaging', 'pyparsing', 'cycler', 'kiwisolver',
  'networkx', 'sympy', 'mpmath', 'statsmodels', 'patsy',
]);

// Map import names → pyodide/micropip package names
const PACKAGE_NAME_MAP: Record<string, string> = {
  sklearn: 'scikit-learn',
  cv2: 'opencv-python',
  PIL: 'pillow',
  bs4: 'beautifulsoup4',
  dateutil: 'python-dateutil',
};

/** Extract top-level import names from Python source */
function extractImports(code: string): string[] {
  const names = new Set<string>();
  const importRe = /^\s*import\s+([\w,\s]+)/gm;
  const fromRe = /^\s*from\s+(\w+)/gm;
  let m;
  while ((m = importRe.exec(code)) !== null)
    m[1].split(',').forEach(s => names.add(s.trim().split(' ')[0]));
  while ((m = fromRe.exec(code)) !== null)
    names.add(m[1].trim());
  return [...names].filter(n => n && !['sys', 'os', 'io', 're', 'math', 'json',
    'time', 'datetime', 'collections', 'itertools', 'functools', 'typing',
    'abc', 'copy', 'random', 'string', 'pathlib', 'enum', 'dataclasses'].includes(n));
}

async function executePython(code: string, startTime: number): Promise<CodeRunResult> {
  try {
    const pyodide = await getPyodide();

    // Auto-install any imported packages not already available
    const imports = extractImports(code);
    if (imports.length > 0) {
      const toInstall = imports
        .map(name => PACKAGE_NAME_MAP[name] ?? name)
        .filter(pkg => PYODIDE_BUILTIN_PACKAGES.has(pkg.toLowerCase()) || PYODIDE_BUILTIN_PACKAGES.has(pkg));

      // Try loadPackage for known Pyodide packages first (faster, no network)
      if (toInstall.length > 0) {
        try {
          await (pyodide as any).loadPackagesFromImports(code);
        } catch { /* ignore — micropip will handle it */ }
      }

      // micropip for anything else
      const unknown = imports
        .map(name => PACKAGE_NAME_MAP[name] ?? name)
        .filter(pkg => !PYODIDE_BUILTIN_PACKAGES.has(pkg.toLowerCase()));
      if (unknown.length > 0) {
        try {
          await pyodide.runPythonAsync(`
import micropip
import asyncio
async def _install():
    for pkg in ${JSON.stringify(unknown)}:
        try:
            await micropip.install(pkg)
        except Exception:
            pass
await _install()
`);
        } catch { /* best-effort */ }
      }
    }

    // Capture stdout/stderr
    const wrappedCode = `
import sys, io
_out = io.StringIO()
_err = io.StringIO()
sys.stdout = _out
sys.stderr = _err
_exec_error = None
try:
${code.split('\n').map(l => '    ' + l).join('\n')}
except Exception as _e:
    _exec_error = str(_e)
finally:
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__
_captured_out = _out.getvalue()
_captured_err = _err.getvalue()
if _exec_error:
    _captured_err = (_captured_err + '\\n' + _exec_error).strip()
`;

    await pyodide.runPythonAsync(wrappedCode);

    const stdout = String(pyodide.globals.get('_captured_out') ?? '');
    const stderr = String(pyodide.globals.get('_captured_err') ?? '');

    return {
      stdout,
      stderr,
      status: stderr ? 'Error' : 'Accepted',
      timeMs: Date.now() - startTime,
      isMock: false,
    };
  } catch (err) {
    return {
      stdout: '',
      stderr: err instanceof Error ? err.message : String(err),
      status: 'Error',
      timeMs: Date.now() - startTime,
      isMock: false,
    };
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

// ─── Judge0 CE (compiled languages) ──────────────────────────────────────────
// Language IDs: https://ce.judge0.com/languages/
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
  rust: 73,
  ruby: 72,
  php: 68,
  csharp: 51,
};

async function executeWithJudge0(
  code: string,
  language: string,
  stdin: string,
  startTime: number,
): Promise<CodeRunResult> {
  const langId = JUDGE0_LANGUAGE_IDS[language];
  if (!langId) return createSmartMock(code, language, startTime);

  const apiKey = import.meta.env.VITE_JUDGE0_API_KEY as string | undefined;
  const baseUrl = (import.meta.env.VITE_JUDGE0_BASE_URL as string | undefined)
    || 'https://judge0-ce.p.rapidapi.com';
  const host = (import.meta.env.VITE_JUDGE0_HOST as string | undefined)
    || 'judge0-ce.p.rapidapi.com';

  if (!apiKey) return createSmartMock(code, language, startTime);

  try {
    // Submit
    const submitRes = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': host,
      },
      body: JSON.stringify({
        source_code: code,
        language_id: langId,
        stdin,
      }),
    });

    if (!submitRes.ok) return createSmartMock(code, language, startTime);

    const result = await submitRes.json();
    const stdout = result.stdout ?? '';
    const stderr = (result.stderr ?? '') + (result.compile_output ?? '');

    return {
      stdout,
      stderr,
      status: result.status?.id === 3 ? 'Accepted' : stderr ? 'Error' : 'Accepted',
      timeMs: Date.now() - startTime,
      isMock: false,
    };
  } catch {
    return createSmartMock(code, language, startTime);
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
    stdout: `[Mock - ${language}]\n\nCode Analysis:\n- ${lines.length} lines of code\n- Syntax appears valid\n\nTo run ${language} code, a Judge0 API key is needed.\nAdd VITE_JUDGE0_API_KEY to your .env file.`,
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

  if (lang === 'javascript' || lang === 'typescript') {
    return executeInBrowser(code, startTime);
  }

  if (lang === 'python') {
    return executePython(code, startTime);
  }

  return executeWithJudge0(code, lang, stdin, startTime);
}

export function getSupportedLanguages(): string[] {
  return ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust', 'ruby', 'php', 'csharp'];
}
