import { z } from 'zod';
import { DocumentType } from './taxonomy';
/**
 * Upload request schema
 */
export declare const UploadDocumentRequestSchema: z.ZodObject<{
    documentType: z.ZodDefault<z.ZodNativeEnum<typeof DocumentType>>;
}, "strip", z.ZodTypeAny, {
    documentType: DocumentType;
}, {
    documentType?: DocumentType | undefined;
}>;
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
export declare const CompareRequestSchema: z.ZodObject<{
    documentAId: z.ZodString;
    documentBId: z.ZodString;
    labelA: z.ZodDefault<z.ZodString>;
    labelB: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    documentAId: string;
    documentBId: string;
    labelA: string;
    labelB: string;
}, {
    documentAId: string;
    documentBId: string;
    labelA?: string | undefined;
    labelB?: string | undefined;
}>;
export type CompareRequest = z.infer<typeof CompareRequestSchema>;
