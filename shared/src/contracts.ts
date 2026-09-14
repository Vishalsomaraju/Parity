import { z } from 'zod';
import {
  DocumentSchema,
  ClauseSchema,
  FinePrintItemSchema,
  KeyTermsSchema,
  ObligationsSchema,
  TimelineItemSchema,
  ComparisonResultSchema,
  QAResponseSchema,
} from './schemas';
import { DocumentType } from './taxonomy';

/**
 * Upload request schema
 */
export const UploadDocumentRequestSchema = z.object({
  documentType: z.nativeEnum(DocumentType).default(DocumentType.FreelanceServices),
});

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'healthy' | 'degraded';
  version: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    database: 'connected' | 'session_fallback';
    redis: 'connected' | 'bypassed';
    ai: 'primary_active' | 'secondary_active' | 'deterministic_fallback';
    worker: 'background_active' | 'in_process_fallback';
  };
}

/**
 * Document Status response
 */
export interface DocumentStatusResponse {
  id: string;
  status: string;
  isDemo: boolean;
  progressPercent: number;
  currentStep: string;
  errorMessage?: string | null;
}

/**
 * Compare request schema
 */
export const CompareRequestSchema = z.object({
  documentAId: z.string().min(1),
  documentBId: z.string().min(1),
  labelA: z.string().default('Document A'),
  labelB: z.string().default('Document B'),
});
export type CompareRequest = z.infer<typeof CompareRequestSchema>;
