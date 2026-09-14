"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareRequestSchema = exports.UploadDocumentRequestSchema = exports.BenchmarkClauseSchema = exports.QAResponseSchema = exports.QARequestSchema = exports.ComparisonResultSchema = exports.ComparisonTopicSchema = exports.DocumentSchema = exports.TimelineItemSchema = exports.ObligationsSchema = exports.KeyTermsSchema = exports.ClauseSchema = exports.FinePrintItemSchema = exports.RiskJudgmentSchema = void 0;
__exportStar(require("./taxonomy"), exports);
__exportStar(require("./types"), exports);
var schemas_1 = require("./schemas");
Object.defineProperty(exports, "RiskJudgmentSchema", { enumerable: true, get: function () { return schemas_1.RiskJudgmentSchema; } });
Object.defineProperty(exports, "FinePrintItemSchema", { enumerable: true, get: function () { return schemas_1.FinePrintItemSchema; } });
Object.defineProperty(exports, "ClauseSchema", { enumerable: true, get: function () { return schemas_1.ClauseSchema; } });
Object.defineProperty(exports, "KeyTermsSchema", { enumerable: true, get: function () { return schemas_1.KeyTermsSchema; } });
Object.defineProperty(exports, "ObligationsSchema", { enumerable: true, get: function () { return schemas_1.ObligationsSchema; } });
Object.defineProperty(exports, "TimelineItemSchema", { enumerable: true, get: function () { return schemas_1.TimelineItemSchema; } });
Object.defineProperty(exports, "DocumentSchema", { enumerable: true, get: function () { return schemas_1.DocumentSchema; } });
Object.defineProperty(exports, "ComparisonTopicSchema", { enumerable: true, get: function () { return schemas_1.ComparisonTopicSchema; } });
Object.defineProperty(exports, "ComparisonResultSchema", { enumerable: true, get: function () { return schemas_1.ComparisonResultSchema; } });
Object.defineProperty(exports, "QARequestSchema", { enumerable: true, get: function () { return schemas_1.QARequestSchema; } });
Object.defineProperty(exports, "QAResponseSchema", { enumerable: true, get: function () { return schemas_1.QAResponseSchema; } });
Object.defineProperty(exports, "BenchmarkClauseSchema", { enumerable: true, get: function () { return schemas_1.BenchmarkClauseSchema; } });
var contracts_1 = require("./contracts");
Object.defineProperty(exports, "UploadDocumentRequestSchema", { enumerable: true, get: function () { return contracts_1.UploadDocumentRequestSchema; } });
Object.defineProperty(exports, "CompareRequestSchema", { enumerable: true, get: function () { return contracts_1.CompareRequestSchema; } });
