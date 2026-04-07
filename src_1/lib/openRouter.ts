/**
 * OpenRouter AI Service
 * Unified AI provider using OpenRouter API
 * Supports multiple free models: Llama, Gemma, Mistral
 */

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Models available on OpenRouter (using paid models with your API key)
const MODELS = [
    "google/gemini-2.0-flash-001",
    "anthropic/claude-3.5-haiku",
    "meta-llama/llama-3.1-70b-instruct"
];

interface OpenRouterResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
    error?: {
        message: string;
    };
}

/**
 * Sleep utility for rate limit handling
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Call OpenRouter API with fallback between free models
 */
export async function callOpenRouter(
    prompt: string,
    options: { json?: boolean; temperature?: number } = {}
): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("VITE_OPENROUTER_API_KEY not configured. Please add your OpenRouter API key to .env file.");
    }

    const errors: string[] = [];

    // Try each model in order with delay between attempts
    for (let i = 0; i < MODELS.length; i++) {
        const model = MODELS[i];
        
        // Add delay between model attempts (rate limit protection)
        if (i > 0) {
            await sleep(500);
        }
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin || "http://localhost:5173",
                    "X-Title": "Campus2Career"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: options.temperature ?? 0.7,
                    max_tokens: 2000,
                    response_format: options.json ? { type: "json_object" } : undefined
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                const errorData = JSON.parse(errorText);
                
                // Check if it's a rate limit error
                if (response.status === 429 || errorData.error?.code === 429) {
                    errors.push(`${model}: Rate limited - will try next model`);
                    continue;
                }
                
                errors.push(`${model}: ${errorText}`);
                continue;
            }

            const data: OpenRouterResponse = await response.json();
            
            if (data.error) {
                errors.push(`${model}: ${data.error.message}`);
                continue;
            }

            if (data.choices?.[0]?.message?.content) {
                return data.choices[0].message.content.replace(/```json|```/g, "").trim();
            }

            errors.push(`${model}: Empty response`);
        } catch (error: any) {
            errors.push(`${model}: ${error.message}`);
        }
    }

    throw new Error(`All OpenRouter models failed: ${errors.join("; ")}`);
}

/**
 * Check if OpenRouter is configured
 */
export function isOpenRouterConfigured(): boolean {
    return !!OPENROUTER_API_KEY;
}

/**
 * Generate text using OpenRouter
 */
export async function generateText(
    prompt: string,
    options?: { temperature?: number }
): Promise<string> {
    return callOpenRouter(prompt, options);
}

/**
 * Generate JSON using OpenRouter
 */
export async function generateJSON<T>(
    prompt: string,
    options?: { temperature?: number }
): Promise<T> {
    const text = await callOpenRouter(prompt, { json: true, temperature: options?.temperature });
    return JSON.parse(text) as T;
}
