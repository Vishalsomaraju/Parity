import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5433/parity'),
  REDIS_URL: z.string().default('redis://localhost:6380'),
  SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.65),
  // Primary AI: Google Gemini
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  // Secondary AI: OpenAI
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  // Worker mode: allow background worker or synchronous in-process fallback
  ENABLE_WORKER: z.coerce.boolean().default(true),
  // Upload limits
  MAX_FILE_SIZE_MB: z.coerce.number().default(15),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().optional().default(''),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

let parsedConfig: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!parsedConfig) {
    const parsed = EnvSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error('[ENV] Configuration validation error:', parsed.error.format());
      throw new Error(`Environment validation failed: ${JSON.stringify(parsed.error.issues)}`);
    }
    parsedConfig = parsed.data;
  }
  return parsedConfig;
}
