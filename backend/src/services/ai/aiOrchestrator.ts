import { z } from 'zod';
import { getConfig } from '../../config/env';
import { sanitizeForPrompt, truncateForLog } from '../../utils/sanitize';

export interface StructuredLLMOptions<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
  deterministicFallback: () => T;
  temperature?: number;
}

export interface LLMResult<T> {
  data: T;
  provider: 'gemini' | 'openai' | 'deterministic_fallback';
  rawOutput?: string;
}

/**
 * Execute structured AI call with:
 * Primary (Gemini) -> Secondary (OpenAI) -> Deterministic Fallback
 */
export async function executeStructuredAI<T>(
  options: StructuredLLMOptions<T>
): Promise<LLMResult<T>> {
  const config = getConfig();

  // In automated test runs, utilize fast deterministic fallback directly
  if (config.NODE_ENV === 'test') {
    return {
      data: options.deterministicFallback(),
      provider: 'deterministic_fallback',
    };
  }

  // Try Primary: Gemini
  if (config.GEMINI_API_KEY && config.GEMINI_API_KEY !== 'none') {
    try {
      const geminiOutput = await callGeminiWithTimeout(
        options.systemPrompt,
        options.userPrompt,
        config.GEMINI_API_KEY,
        config.GEMINI_MODEL,
        options.temperature || 0.1
      );
      const parsed = cleanAndParseJSON(geminiOutput, options.schema);
      if (parsed) {
        return { data: parsed, provider: 'gemini', rawOutput: geminiOutput };
      }
    } catch (err: any) {
      console.warn(`[AI] Primary Gemini call failed: ${err.message}. Trying secondary provider...`);
    }
  }

  // Try Secondary: OpenAI (or compatible proxy)
  if (config.OPENAI_API_KEY) {
    try {
      const openaiOutput = await callOpenAIWithTimeout(
        options.systemPrompt,
        options.userPrompt,
        config.OPENAI_API_KEY,
        config.OPENAI_BASE_URL,
        config.OPENAI_MODEL,
        options.temperature || 0.1
      );
      const parsed = cleanAndParseJSON(openaiOutput, options.schema);
      if (parsed) {
        return { data: parsed, provider: 'openai', rawOutput: openaiOutput };
      }
    } catch (err: any) {
      console.warn(`[AI] Secondary OpenAI call failed: ${err.message}. Activating deterministic fallback.`);
    }
  }

  // Tertiary: Deterministic Fallback
  console.log('[AI] Utilizing deterministic heuristic fallback.');
  return {
    data: options.deterministicFallback(),
    provider: 'deterministic_fallback',
  };
}

/**
 * Call Gemini API with 12-second timeout
 */
async function callGeminiWithTimeout(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string,
  temperature: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = `${systemPrompt}\n\n${sanitizeForPrompt(userPrompt)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${truncateForLog(errText, 120)}`);
    }

    const data: any = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty Gemini response content');
    }
    return candidateText;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call OpenAI API with 12-second timeout
 */
async function callOpenAIWithTimeout(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  baseUrl: string,
  model: string,
  temperature: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const url = `${normalizedBase}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizeForPrompt(userPrompt) },
        ],
        temperature,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI HTTP ${response.status}: ${truncateForLog(errText, 120)}`);
    }

    const data: any = await response.json();
    const candidateText = data?.choices?.[0]?.message?.content;
    if (!candidateText) {
      throw new Error('Empty OpenAI response content');
    }
    return candidateText;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Clean markdown code blocks (```json ... ```) and validate with Zod
 */
export function cleanAndParseJSON<T>(rawText: string, schema: z.ZodSchema<T>): T | null {
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    // Parse JSON
    const parsedObj = JSON.parse(cleaned);
    const result = schema.safeParse(parsedObj);
    if (result.success) {
      return result.data;
    } else {
      console.warn('[AI] JSON Schema validation mismatch:', result.error.issues);
      return null;
    }
  } catch (err: any) {
    console.warn('[AI] JSON parsing failed:', err.message);
    return null;
  }
}
