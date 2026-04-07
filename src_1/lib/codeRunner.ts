const JUDGE0_BASE = import.meta.env.VITE_JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = import.meta.env.VITE_JUDGE0_API_KEY || '';

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  go: 60,
};

export interface CodeRunResult {
  stdout: string;
  stderr: string;
  status: string;
  timeMs: number;
  isMock: boolean;
}

export async function runCode(code: string, language: string, stdin = ''): Promise<CodeRunResult> {
  if (!JUDGE0_KEY) {
    return {
      stdout: `[Mock Output]\nCode received (${code.split('\n').length} lines, ${language})\nConfigure VITE_JUDGE0_API_KEY for real execution.`,
      stderr: '',
      status: 'Mock',
      timeMs: 0,
      isMock: true,
    };
  }

  try {
    const langId = LANGUAGE_IDS[language] || 71;
    const submitRes = await fetch(`${JUDGE0_BASE}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({ source_code: code, language_id: langId, stdin }),
    });

    if (!submitRes.ok) throw new Error(`Judge0 error: ${submitRes.status}`);
    const data = await submitRes.json();

    return {
      stdout: data.stdout || '',
      stderr: data.stderr || data.compile_output || '',
      status: data.status?.description || 'Unknown',
      timeMs: parseFloat(data.time || '0') * 1000,
      isMock: false,
    };
  } catch (err) {
    console.error('Code execution failed:', err);
    return {
      stdout: '',
      stderr: 'Code execution failed. Check your API key or network.',
      status: 'Error',
      timeMs: 0,
      isMock: false,
    };
  }
}
