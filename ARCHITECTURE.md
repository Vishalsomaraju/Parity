# Architecture & Code Quality — Parity

> **Priority Rubric Item:** Code Quality (Isolated domain logic, typed boundaries, strict layering, maintainability)

---

## 1. Architectural Philosophy

Parity is structured as a typed monorepo with clean separation of concerns. Transport code (HTTP/Express), presentation logic (React), and business calculations (classification, scoring, comparison, extraction) are decoupled into dedicated layers. No business calculation or decision logic exists inside React components or route handlers.

```text
┌────────────────────────────────────────────────────────────┐
│                       PRESENTATION                         │
│   React 19 + TypeScript + Vite + Vanilla CSS (No Tailwind) │
│   src/components/ · src/pages/ · src/styles/               │
└─────────────────────────────┬──────────────────────────────┘
                              │ REST API / Typed DTOs
┌─────────────────────────────▼──────────────────────────────┐
│                        TRANSPORT                           │
│   Express Route Handlers · Multer · Rate Limiters · Helmet │
│   backend/src/routes/ · backend/src/middleware/            │
└─────────────────────────────┬──────────────────────────────┘
                              │ Pure Data Contracts
┌─────────────────────────────▼──────────────────────────────┐
│                       DOMAIN LOGIC                         │
│   Segmentation · Scoring Gate · Comparison · Grounded Q&A  │
│   backend/src/services/ (Zero UI or Express dependencies)  │
└─────────────────────────────┬──────────────────────────────┘
                              │ Repository Pattern
┌─────────────────────────────▼──────────────────────────────┐
│                        DATA ACCESS                         │
│   PostgreSQL + pgvector (HNSW) · Resilient Session Store   │
│   backend/src/db/connection.ts                             │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Layer Boundaries & File Responsibilities

| Layer | Responsibility | File Paths |
| :--- | :--- | :--- |
| **Shared Contracts** | Type safety, canonical enums, 20 clause taxonomy, risk tiers, and Zod schemas shared across frontend and backend. | [taxonomy.ts](file:///e:/Parity/shared/src/taxonomy.ts)<br>[schemas.ts](file:///e:/Parity/shared/src/schemas.ts)<br>[contracts.ts](file:///e:/Parity/shared/src/contracts.ts) |
| **Transport & API** | HTTP endpoints, file upload validation, security headers, rate limiting, and error formatting. | [server.ts](file:///e:/Parity/backend/src/server.ts)<br>[routes/api.ts](file:///e:/Parity/backend/src/routes/api.ts)<br>[middleware/security.ts](file:///e:/Parity/backend/src/middleware/security.ts) |
| **Clause Segmentation** | Deterministic regex-first boundary detection with LLM boundary fallback for unstructured text. | [services/segmentation/clauseSplitter.ts](file:///e:/Parity/backend/src/services/segmentation/clauseSplitter.ts) |
| **Two-Stage Scoring** | Vector cosine similarity gate (< threshold conservative assessment; >= threshold batched LLM). | [services/scoring/scoringPipeline.ts](file:///e:/Parity/backend/src/services/scoring/scoringPipeline.ts) |
| **Semantic Comparison** | Document-vs-document comparison aligning clauses across 20 topics, detecting missing protections and calculating scorecard. | [services/comparison/comparisonService.ts](file:///e:/Parity/backend/src/services/comparison/comparisonService.ts) |
| **Grounded Q&A** | Anti-hallucination legal Q&A with exact clause citations, page numbers, and `insufficient_evidence` fallback. | [services/qa/qaService.ts](file:///e:/Parity/backend/src/services/qa/qaService.ts) |
| **Synthesis Engines** | Flagship "Fine Print, Translated", Obligations partitioned by party, Timeline, and Key Terms. | [services/synthesis/finePrintService.ts](file:///e:/Parity/backend/src/services/synthesis/finePrintService.ts)<br>[services/synthesis/obligationsService.ts](file:///e:/Parity/backend/src/services/synthesis/obligationsService.ts)<br>[services/synthesis/timelineService.ts](file:///e:/Parity/backend/src/services/synthesis/timelineService.ts)<br>[services/synthesis/keyTermsService.ts](file:///e:/Parity/backend/src/services/synthesis/keyTermsService.ts) |
| **AI Orchestration** | 2-provider fallback chain (Gemini Flash → OpenAI → Deterministic Heuristics) with JSON schema validation. | [services/ai/aiOrchestrator.ts](file:///e:/Parity/backend/src/services/ai/aiOrchestrator.ts) |
| **Database & Resilience** | Resilient PostgreSQL connection with transparent Degraded Session Mode when database is detached. | [db/connection.ts](file:///e:/Parity/backend/src/db/connection.ts)<br>[db/schema.sql](file:///e:/Parity/backend/src/db/schema.sql) |
| **Presentation** | Flagship Three-Zone Editorial Workspace, Semantic Compare Matrix, and ink-on-paper legal viewer. | [frontend/src/pages/WorkspacePage.tsx](file:///e:/Parity/frontend/src/pages/WorkspacePage.tsx)<br>[frontend/src/pages/ComparePage.tsx](file:///e:/Parity/frontend/src/pages/ComparePage.tsx)<br>[frontend/src/components/document/DocumentViewer.tsx](file:///e:/Parity/frontend/src/components/document/DocumentViewer.tsx) |

---

## 3. Typing & Validation Standards

- **End-to-End Type Safety**: Data flows from request DTOs to internal domain services to serialized responses using shared TypeScript interfaces and Zod validation.
- **Zero Unchecked `any`**: Domain modules strictly use typed entities (`Clause`, `Document`, `FinePrintItem`, `ComparisonTopic`, `QAResponse`).
- **Single Source of Truth**: Shared schemas are defined once in `@parity/shared` and imported across both backend and frontend, eliminating duplicate validation logic.
- **Strict File Limits**: No file in the codebase exceeds ~300 lines of functional code; modules are separated strictly by responsibility.

---

## 4. Resilience & Graceful Degradation Architecture

```text
DEPENDENCY OUTAGE
       ↓
DETECT (Immediate 3-second timeout or error code)
       ↓
FALLBACK:
  • Database offline → Degraded Session Mode (local dev/test) / Fail-safe Startup (production)
  • Worker offline → Synchronous In-Process Execution
  • AI Keys missing / rate limited → Deterministic Fallback Engine
  • Demo Mode → First-class precomputed fixtures
       ↓
USER REMAINS IN FULL CONTROL (No crashes, no unhandled rejections)
```

---

## 5. Production Deployment Topology

```text
                    ┌────────────────────────┐
                    │     Vercel Edge        │
                    │   Frontend (SPA)       │
                    └───────────┬────────────┘
                                │ HTTPS / REST API
                                ▼
                    ┌────────────────────────┐
                    │     Railway Nixpacks   │
                    │   Parity API (Node.js) │
                    └───────────┬────────────┘
                                │ Railway Private Network
                                ▼
                    ┌────────────────────────┐
                    │   Railway PostgreSQL   │
                    │       + pgvector       │
                    └────────────────────────┘
```

- **Frontend**: Deployed independently to **Vercel** as a static single-page application.
- **Backend API**: Deployed to **Railway** from the monorepo root. Builds `@parity/shared` and `@parity/backend` (`npm run build:shared && npm run build:backend`), starts via `node backend/dist/server.js`.
- **Database**: Railway managed PostgreSQL 16 with the `pgvector` extension (`DATABASE_URL` required in production).
- **Queue & Worker**: Zero Redis or BullMQ dependency. Processing uses lightweight in-process dispatching (`setImmediate`) with synchronous fallback.
- **Zero Redis**: Redis is completely excluded from runtime, configuration, and dependencies.
