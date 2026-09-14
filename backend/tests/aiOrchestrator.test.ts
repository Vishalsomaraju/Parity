import { z } from 'zod';
import { cleanAndParseJSON, executeStructuredAI, sanitizeErrorMessage } from '../src/services/ai/aiOrchestrator';
import { resetConfigForTest } from '../src/config/env';

describe('AI Orchestrator Module (Section 21, 22, 29.I, 29.J)', () => {
  const StatusEnum = z.enum(['pending', 'active', 'completed']);
  const TestSchema = z.object({
    status: StatusEnum,
    count: z.number(),
    summary: z.string().optional(),
  });

  describe('JSON Schema Validation & Sanitization', () => {
    it('parses valid JSON string matching schema', () => {
      const raw = JSON.stringify({ status: 'active', count: 42 });
      const parsed = cleanAndParseJSON(raw, TestSchema);
      expect(parsed).toEqual({ status: 'active', count: 42 });
    });

    it('cleans markdown code block formatting before parsing', () => {
      const markdown = '```json\n{"status": "completed", "count": 10}\n```';
      const parsed = cleanAndParseJSON(markdown, TestSchema);
      expect(parsed).toEqual({ status: 'completed', count: 10 });
    });

    it('cleans markdown with leading and trailing model conversational text', () => {
      const modelOutput = `
Here is the extracted analysis you requested:
\`\`\`json
{
  "status": "pending",
  "count": 5
}
\`\`\`
I hope this helps! Let me know if you need anything else.
      `;
      const parsed = cleanAndParseJSON(modelOutput, TestSchema);
      expect(parsed).toEqual({ status: 'pending', count: 5 });
    });

    it('returns null on invalid enum value (Zod enum rejection)', () => {
      const invalidEnum = JSON.stringify({ status: 'UNKNOWN_STATUS', count: 1 });
      const parsed = cleanAndParseJSON(invalidEnum, TestSchema);
      expect(parsed).toBeNull();
    });

    it('returns null on missing required field', () => {
      const missingCount = JSON.stringify({ status: 'active' }); // count is required
      const parsed = cleanAndParseJSON(missingCount, TestSchema);
      expect(parsed).toBeNull();
    });

    it('returns null on wrong data type', () => {
      const wrongType = JSON.stringify({ status: 'active', count: 'FORTY_TWO' });
      const parsed = cleanAndParseJSON(wrongType, TestSchema);
      expect(parsed).toBeNull();
    });

    it('returns null on empty or whitespace response', () => {
      expect(cleanAndParseJSON('', TestSchema)).toBeNull();
      expect(cleanAndParseJSON('   \n  ', TestSchema)).toBeNull();
    });

    it('returns null on malformed truncated JSON syntax', () => {
      const broken = '{"status": "active", count: ';
      const parsed = cleanAndParseJSON(broken, TestSchema);
      expect(parsed).toBeNull();
    });
  });

  describe('Provider Failures & Deterministic Fallback Pipeline', () => {
    it('executes structured AI with deterministic fallback when no API keys are present', async () => {
      const result = await executeStructuredAI({
        systemPrompt: 'System prompt',
        userPrompt: 'User prompt',
        schema: TestSchema,
        deterministicFallback: () => ({ status: 'completed', count: 100 }),
      });

      expect(result.provider).toBe('deterministic_fallback');
      expect(result.data).toEqual({ status: 'completed', count: 100 });
    });

    it('falls back to secondary provider if primary fails or times out', async () => {
      const originalFetch = global.fetch;

      // Mock fetch: first call (Gemini) rejects with timeout, second call (OpenAI) returns valid output
      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(async (url: string) => {
        callCount++;
        if (callCount === 1) {
          // Gemini fails with timeout error
          throw new Error('Gemini API call timed out after 12000ms');
        }
        // OpenAI succeeds
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({ status: 'active', count: 77 }),
                },
              },
            ],
          }),
        };
      });

      // Temporarily simulate having keys
      const origGemini = process.env.GEMINI_API_KEY;
      const origOpenai = process.env.OPENAI_API_KEY;
      process.env.GEMINI_API_KEY = 'mock_gemini_key';
      process.env.OPENAI_API_KEY = 'mock_openai_key';
      resetConfigForTest();

      try {
        const result = await executeStructuredAI({
          systemPrompt: 'System',
          userPrompt: 'User',
          schema: TestSchema,
          deterministicFallback: () => ({ status: 'pending' as const, count: 0 }),
        });

        expect(result.provider).toBe('openai');
        expect(result.data).toEqual({ status: 'active', count: 77 });
      } finally {
        global.fetch = originalFetch;
        process.env.GEMINI_API_KEY = origGemini;
        process.env.OPENAI_API_KEY = origOpenai;
        resetConfigForTest();
      }
    });

    it('falls back to deterministic fallback if all external providers fail', async () => {
      const originalFetch = global.fetch;

      // Both providers fail
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error / service unreachable'));

      const origGemini = process.env.GEMINI_API_KEY;
      const origOpenai = process.env.OPENAI_API_KEY;
      process.env.GEMINI_API_KEY = 'mock_gemini_key';
      process.env.OPENAI_API_KEY = 'mock_openai_key';
      resetConfigForTest();

      try {
        const result = await executeStructuredAI({
          systemPrompt: 'System',
          userPrompt: 'User',
          schema: TestSchema,
          deterministicFallback: () => ({ status: 'completed' as const, count: 42, summary: 'Heuristic fallback' }),
        });

        expect(result.provider).toBe('deterministic_fallback');
        expect(result.data).toEqual({ status: 'completed', count: 42, summary: 'Heuristic fallback' });
      } finally {
        global.fetch = originalFetch;
        process.env.GEMINI_API_KEY = origGemini;
        process.env.OPENAI_API_KEY = origOpenai;
        resetConfigForTest();
      }
    });
  });

  describe('AI Log Secret Redaction', () => {
    it('redacts API keys and secrets from error messages before logging', () => {
      const errWithGeminiKey = 'Failed to connect to https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyA1234567890abcdef';
      const redacted = sanitizeErrorMessage(errWithGeminiKey);
      expect(redacted).not.toContain('AIzaSyA1234567890abcdef');
      expect(redacted).toContain('[REDACTED_API_KEY]');

      const errWithBearer = 'Unauthorized request: Bearer sk-proj-1234567890abcdef123456';
      const redactedBearer = sanitizeErrorMessage(errWithBearer);
      expect(redactedBearer).not.toContain('sk-proj-1234567890abcdef123456');
      expect(redactedBearer).toContain('[REDACTED_BEARER]');
    });
  });
});
