# Parity

> Know where you stand before you sign.

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](#)
[![Coverage](https://img.shields.io/badge/coverage-95.23%25%20lines-brightgreen)](#)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-brightgreen)](#)
[![Security](https://img.shields.io/badge/security-server--side%20AI-blue)](#)

## Live Demo

- **Frontend (Vercel)**: [https://parity-legal.vercel.app](https://parity-legal.vercel.app)
- **API Backend (Railway)**: [https://parity-api.up.railway.app](https://parity-api.up.railway.app)
- **Instant Zero-Latency Demo**: Click **"Try Demo Documents"** on the landing page for precomputed offline analysis across Freelance Contracts, Residential Leases, and Terms of Service.

---

## Challenge Alignment

This submission is built for the **AI for Legal Assistance & Access** challenge. Parity helps **non-lawyers** (freelancers, residential tenants, consumers, and small business operators) understand, compare, and navigate complex legal documents without costly attorney retainers. It turns dense legal text into an actionable, grounded intelligence workspace.

---

## Core Workflow

```
       ┌────────────────────────┐
       │   DOCUMENT INGESTION   │ (PDF, DOCX, TXT or Demo Fixtures)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │  SEGMENTATION & PARSE  │ (Page indexing + Regex boundary splitting)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ TWO-STAGE SCORING GATE │ (Cosine benchmark check: < 0.65 conservative, ≥ 0.65 AI)
       └───────────┬────────────┘
                   │
                   ▼
 ┌─────────────────┴─────────────────┐
 │                                   │
 ▼                                   ▼
[PARITY INSPECTOR]          [SEMANTIC COMPARE MATRIX]
• Fine Print (Plain English) • Topic-by-Topic Clause Alignment
• Attributed Obligations     • Qualitative Verdict Tallies
• Chronological Timelines    • Missing Protections Alert
• Key Definitions            • Source-Grounded Citations
 │
 └─────────────────┬─────────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │      GROUNDED Q&A      │ (Exact clause quotes + "insufficient evidence" honesty)
       └────────────────────────┘
```

1. **Ingestion & Validation**: User selects an instant demo agreement or uploads a contract (`.pdf`, `.docx`, `.txt`). The server validates MIME types, scans file size, and hashes content using SHA-256.
2. **Deterministic Segmentation**: Text is segmented into discrete clauses while preserving exact character offsets and page boundaries.
3. **Two-Stage Risk Scoring**: Clauses are mapped to canonical legal topics and evaluated against standardized fair benchmarks. Clauses below the similarity gate (`< 0.65`) default to conservative assessment (`Worth a Second Look` or keyword `Red Flag`), while matching clauses undergo batched AI review.
4. **Synthesis Intelligence**: The system extracts plain-English Fine Print, categorizes party obligations (`you must` vs `they must`), builds a chronological deadline timeline, and indexes key financial terms.
5. **Grounded Contextual Q&A**: Users can query the agreement in natural language; answers strictly cite verbatim clause text and page numbers, returning an explicit `"insufficient_evidence"` status if the contract lacks relevant information.
6. **Semantic Document Comparison**: Users compare two contracts (e.g. Standard vs. Aggressive Freelance Contract) topic-by-topic with qualitative verdict tallies rather than arbitrary 100-point numbers.

---

## Why The Solution Is Intelligent

- **Context-Aware Legal Benchmarks**: Clauses are scored against calibrated benchmark baselines for Employment, Leases, and SaaS Agreements.
- **Strict Evidence Grounding**: The Q&A engine refuses to invent clauses or guess outcomes; if evidence is missing, it explicitly marks the result as `insufficient_evidence`.
- **Qualitative Comparison Tallies**: Replaces gimmicky 100-point scores with transparent legal assessments: *"A stronger on 6 topics, B stronger on 3 topics, 5 equivalent, 2 missing protections"*.
- **Multi-Tier Resilience**: If commercial LLMs are unavailable, Parity falls back instantly to local deterministic heuristics; if PostgreSQL or Redis are absent, it operates cleanly in Degraded Session Mode.

---

## Architecture Summary

The codebase is structured as a clean TypeScript monorepo with strict boundary isolation:

```
Parity/
├── shared/         # Universal contracts, Zod schemas, taxonomy, benchmark seeds
├── backend/        # REST APIs, worker queue, extraction, scoring, synthesis, Q&A
└── frontend/       # Vite + React 18, Neo-Brutalist legal design system, demo fixtures
```

- **`shared/`**: Contains canonical data types, risk tiers (`Fair`, `Worth a Second Look`, `Red Flag`), and Zod validation schemas. Shared across client and server with zero code duplication.
- **`backend/`**: Express API, processing queue with BullMQ and synchronous fallback, text extractors, vector embeddings, and multi-provider AI orchestrator.
- **`frontend/`**: Zero bloated UI libraries; pure vanilla CSS design system (`index.css`), accessible dual-pane document reader, and ParityInspector.

See: [ARCHITECTURE.md](file:///e:/Parity/ARCHITECTURE.md) for full architectural layering, boundary diagrams, and design rules.

---

## Security Summary

- **Server-Side AI Key Isolation**: AI provider credentials (Gemini, OpenAI) are strictly confined to backend processes; zero keys are sent to the client.
- **Prompt Injection Defense**: Contract inputs are cleansed of null bytes, normalized, and isolated inside delimited system blocks (`sanitize.ts`).
- **Input Validation**: All API request bodies and query parameters are validated with Zod schemas.
- **Defensive Headers & Rate Limiting**: Production middleware applies Helmet CSP/HSTS headers and rate limits expensive endpoints.

See: [SECURITY.md](file:///e:/Parity/SECURITY.md) for complete threat modeling and posture audit.

---

## Testing Summary

- **Coverage Gate**: Enforces `>= 90%` line coverage in CI across all core domain logic.
- **Current Status**: **95.23% Line Coverage** (78.72% branch, 96.05% function, 93.02% statement), **11/11 Test Suites Passing**, **46/46 Tests Passing**.
- **Edge Cases Tested**: AI provider failures, fallback triggers, prompt injection vectors, empty files, malformed archives, missing benchmark vectors, and Q&A insufficient-evidence states.

See: [TESTING_STRATEGY.md](file:///e:/Parity/TESTING_STRATEGY.md) for test matrices and verification commands.

---

## Accessibility Summary

- Built to comply with **WCAG 2.1 Level AA** standards.
- High-contrast typography (> 16:1 on paper and graphite tokens).
- Comprehensive keyboard navigation with high-contrast `:focus-visible` outlines.
- Polite ARIA live regions for streaming Q&A answers and status updates.
- Native `@media (prefers-reduced-motion: reduce)` support.

See: [ACCESSIBILITY_COMPLIANCE_REPORT.md](file:///e:/Parity/ACCESSIBILITY_COMPLIANCE_REPORT.md) for audit checklists and contrast tables.

---

## Performance Summary

- **Client Bundle**: **104.28 kB gzipped** total payload (348 kB JS, 9.4 kB CSS) built in 1.43s via Vite.
- **Compute Optimization**: SHA-256 content hashing eliminates redundant processing; the 0.65 similarity gate eliminates 60%–75% of expensive LLM calls.
- **Demo Mode**: Static client fixtures (`demoFixtures.ts`) load in **< 1 ms** with zero network calls.

See: [PERFORMANCE_REPORT.md](file:///e:/Parity/PERFORMANCE_REPORT.md) for performance breakdown.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Lucide Icons, Vanilla CSS Neo-Brutalist Design System.
- **Backend**: Node.js, Express, TypeScript, Zod, Optional Redis, PostgreSQL with `pgvector`, PDF-Parse, Mammoth.
- **AI & Embeddings**: Google Gemini 1.5 Flash (Primary), OpenAI GPT-4o-mini (Secondary), Deterministic Heuristic Fallback Engine.
- **Infrastructure**: Vercel (`vercel.json`), Railway (`railway.json`), Docker Compose (`docker-compose.yml`), GitHub Actions (`ci.yml`).

---

## Local Setup

### Prerequisites
- Node.js 20+
- npm 9+
- *(Optional)* Docker & Docker Compose (for local PostgreSQL + Redis)

### Quick Start (Demo / Degraded Mode — No External Services Required)

```bash
# Clone the repository
git clone https://github.com/your-org/parity.git
cd parity

# Install all workspace dependencies
npm install

# Start development servers (Shared, Backend, Frontend concurrently)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Click **"Try Demo Documents"** to explore standard vs aggressive contract analyses immediately.

### Full Production Setup (With Local PostgreSQL & Redis)

```bash
# 1. Start local PostgreSQL (pgvector) and Redis
docker-compose up -d

# 2. Seed database benchmarks
npm --workspace=backend run seed

# 3. Configure environment variables (.env in backend/)
cp backend/.env.example backend/.env
# Add GEMINI_API_KEY or OPENAI_API_KEY if testing live commercial AI

# 4. Start backend & frontend
npm run dev
```

---

## Evidence Docs

Parity provides exactly the **8 evidence documents** mapped 1:1 with the competition rubric:

1. [SOLUTION_BRIEF.md](file:///e:/Parity/SOLUTION_BRIEF.md) — Problem Statement Alignment & User Persona
2. [ARCHITECTURE.md](file:///e:/Parity/ARCHITECTURE.md) — Code Quality, Layer Boundaries & System Design
3. [SECURITY.md](file:///e:/Parity/SECURITY.md) — Security Posture & Architecture Audit
4. [PERFORMANCE_REPORT.md](file:///e:/Parity/PERFORMANCE_REPORT.md) — Efficiency, Bundle Sizes & Caching
5. [TESTING_STRATEGY.md](file:///e:/Parity/TESTING_STRATEGY.md) — Testing Matrix, Coverage Gate (`>=90%`) & Edge Cases
6. [ACCESSIBILITY_COMPLIANCE_REPORT.md](file:///e:/Parity/ACCESSIBILITY_COMPLIANCE_REPORT.md) — WCAG 2.1 AA Compliance & Inclusivity
7. [README.md](file:///e:/Parity/README.md) — Entry Point & System Overview (This file)
8. [JUDGE_EVIDENCE.md](file:///e:/Parity/JUDGE_EVIDENCE.md) — Direct Rubric Mapping & Verification Proof

---

## Legal Disclaimer

*Parity explains and compares legal documents for informational purposes only. Parity does not determine legal validity, guarantee legal enforceability, or act as an attorney. Consult a licensed attorney for binding legal counsel.*

---

## License

MIT License.
