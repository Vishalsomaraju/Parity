"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareRequestSchema = exports.UploadDocumentRequestSchema = void 0;
const zod_1 = require("zod");
const taxonomy_1 = require("./taxonomy");
/**
 * Upload request schema
 */
exports.UploadDocumentRequestSchema = zod_1.z.object({
    documentType: zod_1.z.nativeEnum(taxonomy_1.DocumentType).default(taxonomy_1.DocumentType.FreelanceServices),
});
/**
 * Compare request schema
 */
exports.CompareRequestSchema = zod_1.z.object({
    documentAId: zod_1.z.string().min(1),
    documentBId: zod_1.z.string().min(1),
    labelA: zod_1.z.string().default('Document A'),
    labelB: zod_1.z.string().default('Document B'),
});
