# Security Posture & Architecture — Parity

> **Priority Rubric Item:** Security (Server-side AI mediation, threat mitigation, data protection, and secure boundaries)

---

## 1. Threat Model & Security Posture

Legal document processing involves sensitive contractual terms, personal information, and proprietary business intellectual property. Parity enforces strict defense-in-depth principles:

```text
┌────────────────────────────────────────────────────────────┐
│                    EXTERNAL BROWSER                        │
│   Zero AI Secrets · Strict CORS · Sanitized JSON Only      │
└─────────────────────────────┬──────────────────────────────┘
                              │ TLS / HTTPS
┌─────────────────────────────▼──────────────────────────────┐
│                    SECURITY MIDDLEWARE                     │
│   Helmet Headers · IP Rate Limiting · Multer Memory Buffer │
└─────────────────────────────┬──────────────────────────────┘
                              │ Zod Schema Validation
┌─────────────────────────────▼──────────────────────────────┐
│                    PROMPT DEFENSE LAYER                    │
│   Injection Sanitizer · Delimiter Escapes · Size Capping   │
└─────────────────────────────┬──────────────────────────────┘
                              │ Server-Side Only
┌─────────────────────────────▼──────────────────────────────┐
│                    ISOLATED AI PROVIDER                    │
│   Gemini / OpenAI API Keys stored in backend env only      │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Implemented Security Controls

### 2.1 Complete Server-Side AI Secret Isolation
- All LLM API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) reside strictly in server-side environment variables.
- The browser client has zero knowledge of model provider endpoints, authorization tokens, or billing credentials.
- Proof: [backend/src/config/env.ts](file:///e:/Parity/backend/src/config/env.ts) and [backend/src/services/ai/aiOrchestrator.ts](file:///e:/Parity/backend/src/services/ai/aiOrchestrator.ts).

### 2.2 Boundary Validation with Zod
- All inbound requests (file uploads, document IDs, contextual questions, comparison pairings) are strictly validated using shared Zod schemas before reaching domain logic.
- Malformed inputs are rejected with descriptive `400 Bad Request` responses before expensive AI processing is triggered.
- Proof: [shared/src/schemas.ts](file:///e:/Parity/shared/src/schemas.ts) and [backend/src/routes/api.ts](file:///e:/Parity/backend/src/routes/api.ts).

### 2.3 Defense Against Prompt Injection Attacks
- Uploaded contract texts and user questions are sanitized through a multi-pass regex filter that neutralizes prompt injection patterns (e.g., `ignore all previous instructions`, `SYSTEM PROMPT:`, `jailbreak`, `act as an unrestricted agent`).
- Text lengths are strictly bounded to prevent context stuffing and token exhaustion attacks.
- Proof: [backend/src/utils/sanitize.ts](file:///e:/Parity/backend/src/utils/sanitize.ts) and tested in [backend/tests/sanitize.test.ts](file:///e:/Parity/backend/tests/sanitize.test.ts).

### 2.4 Parameterized SQL Queries (Zero SQL Injection)
- 100% of database interactions use parameterized queries (`$1, $2, ...`) through PostgreSQL's native protocol.
- No string concatenation or template literal interpolation is ever used in database statements.
- Proof: [backend/src/db/connection.ts](file:///e:/Parity/backend/src/db/connection.ts).

### 2.5 Multi-Tier Rate Limiting
- General API endpoints are restricted to 300 requests per 15-minute window via `express-rate-limit`.
- Expensive AI and document ingestion endpoints are throttled to 60 operations per 5 minutes to prevent Denial-of-Service and billable quota exhaustion.
- Proof: [backend/src/middleware/security.ts](file:///e:/Parity/backend/src/middleware/security.ts).

### 2.6 Ephemeral Upload Handling
- Uploaded files are processed in-memory via `multer.memoryStorage()`.
- No persistent unencrypted files are left lingering on local disk or exposed to web roots.
- Proof: [backend/src/routes/api.ts](file:///e:/Parity/backend/src/routes/api.ts).

### 2.7 Sanitized Error Handling
- The centralized error middleware intercepts all unhandled errors. In production, generic non-leaking messages (`"An unexpected server error occurred"`) are returned, preventing database connection strings, model keys, or stack traces from reaching clients.
- Proof: [backend/src/middleware/security.ts](file:///e:/Parity/backend/src/middleware/security.ts).
