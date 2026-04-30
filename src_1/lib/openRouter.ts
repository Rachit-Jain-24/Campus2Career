/**
 * OpenRouter AI Service — proxied through backend (Render free tier)
 * API key lives server-side in the Python backend, never in the browser bundle.
 *
 * Render free tier spins down after 15 min of inactivity.
 * Cold start takes ~30s. We handle this with:
 *  1. A /health ping before the first real request
 *  2. A longer timeout (60s) on the first attempt
 *  3. A warmup() export so pages can pre-ping on mount
 */

const BACKEND_URL = (import.meta.env.VITE_AI_BACKEND_URL as string | undefined)
  || 'http://localhost:8000';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Track whether the backend has been confirmed alive this session
let _backendWarmedUp = false;

/**
 * Ping /health to wake up the Render instance.
 * Call this on page mount for pages that use AI features.
 * Safe to call multiple times — only pings once per session.
 */
export async function warmupBackend(): Promise<void> {
  if (_backendWarmedUp) return;
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(60_000), // 60s — enough for cold start
    });
    if (res.ok) _backendWarmedUp = true;
  } catch {
    // Silently ignore — callOpenRouter will retry anyway
  }
}

/**
 * Call AI via the secure backend proxy.
 * The OpenRouter API key never leaves the server.
 */
export async function callOpenRouter(
  prompt: string,
  options: { json?: boolean; temperature?: number } = {}
): Promise<string> {
  // Warm up first if not already done (handles Render cold start)
  if (!_backendWarmedUp) {
    await warmupBackend();
  }

  // Retry up to 2 times on transient failures
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(2000);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          json_mode: options.json ?? false,
          temperature: options.temperature ?? 0.7,
          max_tokens: 2000,
        }),
        signal: AbortSignal.timeout(90_000), // 90s covers cold start + AI response time
      });

      if (res.status === 429) throw new Error('Rate limit reached. Please wait a moment.');
      if (!res.ok) throw new Error(`AI service error: ${res.status}`);

      _backendWarmedUp = true;
      const data = await res.json();
      return (data.result as string).replace(/```json|```/g, '').trim();
    } catch (err: any) {
      if (attempt === 1) throw err;
    }
  }
  throw new Error('AI service unavailable');
}

/** Returns true if the backend URL is configured */
export function isOpenRouterConfigured(): boolean {
  return true;
}

export async function generateText(prompt: string, options?: { temperature?: number }): Promise<string> {
  return callOpenRouter(prompt, options);
}

export async function generateJSON<T>(prompt: string, options?: { temperature?: number }): Promise<T> {
  const text = await callOpenRouter(prompt, { json: true, temperature: options?.temperature });
  return JSON.parse(text) as T;
}
