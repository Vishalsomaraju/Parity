import { z } from 'zod';
import { cleanAndParseJSON, executeStructuredAI } from '../src/services/ai/aiOrchestrator';

describe('AI Orchestrator Module', () => {
  const TestSchema = z.object({
    status: z.string(),
    count: z.number(),
  });

  it('parses valid JSON string matching schema', () => {
    const raw = JSON.stringify({ status: 'active', count: 42 });
    const parsed = cleanAndParseJSON(raw, TestSchema);
    expect(parsed).toEqual({ status: 'active', count: 42 });
  });

  it('cleans markdown code block formatting before parsing', () => {
    const markdown = '```json\n{"status": "ok", "count": 10}\n```';
    const parsed = cleanAndParseJSON(markdown, TestSchema);
    expect(parsed).toEqual({ status: 'ok', count: 10 });
  });

  it('returns null on schema validation failure', () => {
    const invalidSchema = JSON.stringify({ status: 123, count: 'not a number' });
    const parsed = cleanAndParseJSON(invalidSchema, TestSchema);
    expect(parsed).toBeNull();
  });

  it('returns null on malformed JSON syntax', () => {
    const broken = '{"status": "broken", count: ';
    const parsed = cleanAndParseJSON(broken, TestSchema);
    expect(parsed).toBeNull();
  });

  it('executes structured AI with deterministic fallback in test environment', async () => {
    const result = await executeStructuredAI({
      systemPrompt: 'System',
      userPrompt: 'User',
      schema: TestSchema,
      deterministicFallback: () => ({ status: 'fallback_ok', count: 99 }),
    });

    expect(result.provider).toBe('deterministic_fallback');
    expect(result.data).toEqual({ status: 'fallback_ok', count: 99 });
  });
});
