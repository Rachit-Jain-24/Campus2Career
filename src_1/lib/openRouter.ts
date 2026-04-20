/**
 * OpenRouter AI Service — proxied through backend
 * API key lives server-side in the Python backend, never in the browser bundle.
 */

// Points to the deployed Railway backend (set in .env as VITE_AI_BACKEND_URL)
// Falls back to localhost for development
const BACKEND_URL = (import.meta.env.VITE_AI_BACKEND_URL as string | undefined)
  || 'http://localhost:8000';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Call AI via the secure backend proxy.
 * The OpenRouter API key never leaves the server.
 */
export async function callOpenRouter(
  prompt: string,
  options: { json?: boolean; temperature?: number } = {}
): Promise<string> {
  // Retry up to 2 times on transient failures
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(1000);
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
      });

      if (res.status === 429) throw new Error('Rate limit reached. Please wait a moment.');
      if (!res.ok) throw new Error(`AI service error: ${res.status}`);

      const data = await res.json();
      return (data.result as string).replace(/```json|```/g, '').trim();
    } catch (err: any) {
      if (attempt === 1) throw err;
    }
  }
  throw new Error('AI service unavailable');
}

/** Returns true if the backend URL is configured (always true — backend handles key check) */
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
