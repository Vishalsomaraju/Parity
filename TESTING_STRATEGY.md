# Testing Strategy & Verification Report: Parity

> Automated Quality Assurance, Coverage Audits, and Verification Strategy for Parity.

---

## 1. Testing Philosophy & Quality Gate

Parity enforces rigorous automated quality gates to guarantee that legal document parsing, risk scoring, grounded question-answering, and semantic document comparisons remain deterministic, safe, and bug-free.

### Hard Coverage Threshold
As specified in the competition guidelines, core domain logic must meet or exceed a **90% coverage gate**:
- **CI Gate Enforced**: `90%` statement and line coverage on core business logic (`services/` and `utils/`).
- **Current Backend Test Coverage**:
  - **Overall Line Coverage**: **95.23%** (Core domain logic)
  - **Overall Function Coverage**: **96.05%**
  - **Overall Statement Coverage**: **93.02%**
  - **Branch Coverage**: **78.72%** (Disclosed transparently; edge cases and fallback branches documented)
  - **Clause Segmentation (`clauseSplitter.ts`)**: **98.30% Lines** (100% Functions)
  - **Semantic Comparison (`comparisonService.ts`)**: **92.06% Lines**
  - **Question & Answering (`qaService.ts`)**: **97.05% Lines** (100% Functions)
  - **Synthesis Engines (`services/synthesis/`)**: **93.75% Lines** (100% Functions)
  - **Risk Scoring Pipeline (`scoringPipeline.ts`)**: **95.94% Lines**
  - **Utilities (`hash.ts`, `sanitize.ts`)**: **100.00% Lines** (100% Functions)
- **Test Execution Stats**: **11 Test Suites Passing**, **46 Tests Passing**, **0 Failures**.

---

## 2. Test Suite Matrix

| Test Suite | File Path | Focus & Scenarios Tested |
| :--- | :--- | :--- |
| **API Endpoints & Flow** | `backend/tests/api.test.ts` | Health check, document upload, status polling, full document retrieval, clause inspection, Q&A interaction, two-document compare endpoint, and 404/400 boundary error handling. |
| **Scoring Pipeline** | `backend/tests/scoringPipeline.test.ts` | Two-stage similarity gate: cosine distance comparison against seeded benchmarks, `< 0.65` conservative default (`Worth a Second Look`), keyword-triggered `Red Flag` elevation, and batched LLM scoring. |
| **Grounded Q&A** | `backend/tests/qaService.test.ts` | Answering questions with verbatim clause citations, page number tracking, and strict verification of the `"insufficient_evidence"` status when documents lack relevant answers. |
| **Semantic Comparison** | `backend/tests/comparisonService.test.ts` | Topic-by-topic clause alignment across Document A and Document B, missing protections detection, qualitative scorecard tallies (avoiding fake 100-point scores), and verdict derivation. |
| **Clause Segmentation** | `backend/tests/clauseSplitter.test.ts` | Regex boundary detection (numbered sections, title patterns, double linebreaks), preservation of page boundaries, character offsets, and fallback boundary identification. |
| **Text Extraction** | `backend/tests/extraction.test.ts` | Extraction of plain text (`.txt`), Word documents (`.docx`), PDF page simulation, and malformed archive error recovery without server crashing. |
| **AI Orchestration** | `backend/tests/aiOrchestrator.test.ts` | Two-provider fallback chain (Gemini 1.5 Flash → OpenAI GPT-4o-mini → Deterministic Fallback), JSON Schema Zod validation, JSON cleaning, and test-mode immediate bypass. |
| **Synthesis Services** | `backend/tests/synthesisServices.test.ts` | Fine print extraction, plain English translation, actionable advice generation, obligation party attribution, and timeline milestone sorting. |
| **Key Terms & Definitions** | `backend/tests/extraSynthesis.test.ts` | Extraction of financial caps, governing law, IP ownership rules, and term definitions with boundary conditions. |
| **Embeddings & Vector Math** | `backend/tests/embeddingService.test.ts` | 768-dimensional normalized vector generation, cosine similarity math, unit vector identity ($1.0$), and orthogonality ($0.0$). |
| **Security & Sanitization** | `backend/tests/sanitize.test.ts` | HTML entity escaping, null byte stripping, prompt injection deflection, and whitespace normalization. |

---

## 3. Critical Test Scenarios & Edge Cases

### 3.1 Grounded Q&A Without Hallucination
- **Requirement**: If a contract does not mention a topic (e.g. *"Can they terminate me without cause?"* in a lease with no termination clause), the engine **must not hallucinate**.
- **Test Case (`qaService.test.ts`)**:
  ```typescript
  test('returns insufficient_evidence when question cannot be answered by document', async () => {
    const response = await answerDocumentQuestion(testDoc, 'What is the pet policy for dogs?');
    expect(response.status).toBe('insufficient_evidence');
    expect(response.answer).toContain('could not find');
    expect(response.citations).toHaveLength(0);
  });
  ```

### 3.2 Two-Stage Similarity Gate (`SIMILARITY_THRESHOLD = 0.65`)
- **Requirement**: Deviant clauses (< 0.65 similarity to fair benchmarks) should immediately receive conservative assessments without wasting LLM tokens.
- **Test Case (`scoringPipeline.test.ts`)**:
  ```typescript
  test('evaluates clauses below similarity gate with conservative risk rating', async () => {
    const results = await scoreClauses(testClauses, DocumentType.EMPLOYMENT_FREELANCE);
    const aggressiveClause = results.find(r => r.clauseId === 'clause_agg');
    expect(aggressiveClause.similarityScore).toBeLessThan(0.65);
    expect(['Worth a Second Look', 'Red Flag']).toContain(aggressiveClause.riskTier);
  });
  ```

### 3.3 Degraded Database & Cache Handling
- **Requirement**: When PostgreSQL and Redis are absent, the application must operate cleanly in Degraded Session Mode without throwing unhandled connection rejections.
- **Verification**: Verified via `connection.ts` and `processingQueue.ts` in all unit tests running without a live database daemon.

---

## 4. Continuous Integration Pipeline (`.github/workflows/ci.yml`)

The CI pipeline runs automatically on pull requests and commits to `main`:
1. **Lint Check**: `npm run lint` ensures standard TypeScript formatting and no unhandled warnings.
2. **Typecheck**: `npm run typecheck` across `@parity/shared`, `@parity/backend`, and `@parity/frontend`.
3. **Automated Unit & Integration Tests**: `npm test` executes the 11 Jest test suites.
4. **Coverage Enforcement**: `npm --workspace=backend run test:coverage` validates that core logic adheres to the `>= 90%` lines coverage threshold.
5. **Production Build Verification**: `npm run build` compiles shared contracts, backend Node.js distribution, and Vite client bundle.

---

## 5. Verification Commands

To run the complete verification suite locally:

```bash
# Run all unit and integration tests
npm test

# Run backend coverage gate audit
npm --workspace=backend run test:coverage

# Run TypeScript typechecks across all 3 workspaces
npm run typecheck

# Run production build
npm run build
```
