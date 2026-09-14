# Solution Brief — Parity

> **Tagline:** *Know where you stand before you sign.*  
> **Problem Statement Alignment:** AI for Legal Assistance & Access

---

## 1. Challenge Fit

Parity addresses the **AI for Legal Assistance & Access** challenge by helping non-lawyers (freelancers, independent contractors, residential tenants, and everyday consumers) understand, compare, and navigate legal documents without professional assistance. It demystifies fine print, highlights asymmetric liabilities, extracts actionable duties, aligns contracts side-by-side, and equips signers with grounded questions before signing binding agreements.

---

## 2. Target User

- **Primary User**: Freelancers, independent contractors, residential tenants, small business founders, and everyday consumers.
- **Situation**: Presented with dense, multi-page legal agreements (client contracts, commercial or residential leases, SaaS terms of service) on short notice.
- **Current Pain Point**: Standard agreements are written in intimidating legalese that obscures one-sided risk shifts (unlimited liability, unilateral indemnity, forfeiture of accrued pay, broad non-competes, entry without notice). Hiring an attorney for routine reviews is cost-prohibitive ($350–$750/hr), creating extreme information asymmetry.

---

## 3. Core Problem

Legal documents are intentionally drafted with one-sided legal jargon that disadvantages the signer. Non-lawyers rarely read or understand the full text, cannot easily discern whether a clause deviates from fair market standards, and struggle to identify critical protections that are missing entirely when comparing two competing offers or agreements.

---

## 4. Product Goal

Parity is engineered to help non-lawyers:
1. **Understand what the document says**: Deconstruct dense legal agreements into discrete, categorized sections accompanied by plain-English explanations.
2. **Find what matters**: Translate dangerous gotchas into blunt real-world headlines through **Fine Print, Translated** (ordered with Red Flags first).
3. **Compare options (#1 Differentiator)**: Compare two agreements (e.g. two job offers, two leases, two service contracts) through **Semantic Topic Alignment**, exposing which document protects the signer better topic-by-topic and revealing missing protections.
4. **Decide what to do next**: Track obligations and timelines, and ask grounded questions with verbatim source citations without risk of AI hallucinations.

---

## 5. Primary Workflow

```text
UPLOAD / SELECT DEMO
        ↓
   EXTRACTION (PDF, DOCX, TXT with page tracking)
        ↓
 DETERMINISTIC SEGMENTATION (Regex-first + LLM boundary fallback)
        ↓
 TWO-STAGE SCORING GATE (Cosine benchmark retrieval + batched LLM)
        ↓
 SYNTHESIS (Fine Print Translated, Obligations by Party, Timeline, Key Terms)
        ↓
 COMPARE WORKSPACE (Semantic topic alignment & difference verdicts)
        ↓
 GROUNDED Q&A (Exact citations to clause, page, and quoted excerpt)
```

---

## 6. Why This Aligns With The Challenge

- **Makes Legal Information Accessible**: Replaces legalese with plain-language, real-world consequences non-lawyers can immediately act upon.
- **Non-Alarmist Market Benchmarking**: Instead of manufacturing alarm over standard terms, clauses are evaluated against a curated 32+ market benchmark corpus. Below-threshold clauses default to *Worth a Second Look*, reserving *Red Flag* for genuine open-ended liabilities or rights forfeitures.
- **Strict Informational Boundary**: Parity explicitly does not act as an attorney, draft binding pleadings, or determine statutory enforceability. Ubiquitous disclaimers reinforce that Parity prepares users to negotiate or consult counsel intelligently.

---

## 7. Intelligent / AI Behavior

- **Context-Aware Semantic Topic Alignment**: When comparing two agreements, Parity aligns clauses across 20 canonical legal categories based on meaning rather than section numbers or headings.
- **Tripartite Anti-Hallucination Q&A**: Every AI query explicitly returns status (`grounded` vs `insufficient_evidence`). If an answer is not established by the document text, Parity refuses to fabricate and states that the topic is omitted.
- **Adaptive Scoring**: High-similarity clauses receive nuanced LLM reasoning; non-standard clauses receive conservative safety assessments.

---

## 8. Fallback & Survival Behavior

- **PostgreSQL Offline**: Parity gracefully transitions to **Degraded Session Mode** (transient session store, no crash).
- **LLM / API Keys Missing**: 2-provider chain falls back from Gemini to OpenAI to deterministic heuristic analysis.
- **Worker Detached**: Background processing gracefully switches to synchronous in-process execution.
- **First-Class Demo Mode**: 100% precomputed fixtures enable judges to evaluate the complete product with zero external network or database dependencies.

---

## 9. Success Criteria

1. Non-lawyer can upload a contract or click demo and understand key obligations and gotchas in under 60 seconds.
2. Two agreements can be compared side-by-side with clear topic verdicts ("A better", "B better", "Equivalent", "Missing protection").
3. Contextual questions return verified page and clause citations, refusing to hallucinate when evidence is absent.
4. The system remains operational and useful even during total cloud service failures.
