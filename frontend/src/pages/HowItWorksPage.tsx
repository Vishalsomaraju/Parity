import React from 'react';

interface HowItWorksPageProps {
  onOpenUpload: () => void;
  onOpenCompare: () => void;
  onStartDemo: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onOpenUpload,
  onOpenCompare,
  onStartDemo,
}) => {
  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge badge-demo" style={{ marginBottom: '16px', display: 'inline-block' }}>
          § Architecture & Methodology
        </span>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
            marginBottom: '16px',
            fontFamily: 'var(--font-sans)',
          }}
        >
          How Parity Works
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary-dark)',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Parity is built for the PromptWars problem statement: <em>AI for Legal Assistance & Access</em>.
          It combines deterministic parsing, benchmark vector similarity gating, and multi-tier GenAI models to make legal agreements understandable for non-lawyers.
        </p>
      </div>

      {/* 5-Step Pipeline Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
        {/* Step 1 */}
        <div className="inspector-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent-gold)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)' }}>01</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              Text Extraction & Deterministic Section Segmentation
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.6 }}>
            Uploaded PDF, DOCX, or TXT documents are parsed in-memory without persistent disk retention. A regex boundary detector splits the text into structured clauses using standard legal numbering and heading patterns. If deterministic splitting yields fewer than 3 sections (e.g. poorly formatted contracts), an LLM boundary fallback activates to recover the natural clauses.
          </p>
        </div>

        {/* Step 2 */}
        <div className="inspector-card" style={{ padding: '24px', borderLeft: '4px solid #60a5fa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#60a5fa' }}>02</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              Benchmark Vector Similarity Gating (Threshold = 0.65)
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.6 }}>
            Each detected clause is embedded and compared against an authoritative standard benchmark corpus stored in PostgreSQL via <code style={{ color: '#93c5fd' }}>pgvector</code>. Clauses that deviate significantly from standard commercial protections (<code style={{ color: '#93c5fd' }}>similarity &lt; 0.65</code>) trigger automatic conservative risk assessments and deeper GenAI examination.
          </p>
        </div>

        {/* Step 3 */}
        <div className="inspector-card" style={{ padding: '24px', borderLeft: '4px solid #34d399' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>03</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              Plain-Language Editorial Synthesis
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.6 }}>
            Rather than generic 0–100 scores, Parity translates dense legalese into concrete real-world consequences:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', color: 'var(--text-secondary-dark)', fontSize: '13px', lineHeight: 1.7 }}>
            <li><strong>Fine Print, Translated:</strong> Uncovers buried gotchas (e.g., unlimited indemnities, unilateral IP assignment).</li>
            <li><strong>Key Terms:</strong> Parties, payment schedules, duration, deposits, and governing jurisdiction.</li>
            <li><strong>Obligations:</strong> Separated into <em>Your Obligations</em>, <em>Their Obligations</em>, and mutual requirements.</li>
            <li><strong>Timeline:</strong> Critical dates, cure periods, notice windows, and renewal triggers arranged chronologically.</li>
          </ul>
        </div>

        {/* Step 4 */}
        <div className="inspector-card" style={{ padding: '24px', borderLeft: '4px solid #a78bfa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#a78bfa' }}>04</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              Document-vs-Document Semantic Comparison
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.6 }}>
            Parity aligns two agreements across 20 canonical legal categories (Payment, IP, Liability, Indemnity, Non-Compete, Termination, etc.), highlighting which document offers stronger protections, which terms are equivalent, and where protections are completely missing in Document A or B.
          </p>
        </div>

        {/* Step 5 */}
        <div className="inspector-card" style={{ padding: '24px', borderLeft: '4px solid #f87171' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#f87171' }}>05</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              Grounded Anti-Hallucination Q&A with Clause Citations
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.6 }}>
            Every answer provided by the contextual Q&A engine is grounded directly in the document text. The response includes the supporting clause ID, page number, and verbatim excerpt. If the document does not contain sufficient evidence, Parity explicitly reports <em>insufficient evidence</em> rather than guessing.
          </p>
        </div>
      </div>

      {/* Resilience Architecture Callout */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface-dark)',
          border: '1px solid var(--border-dark)',
          borderRadius: '8px',
          padding: '28px',
          marginBottom: '48px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
          🛡️ Resilient Degradation Architecture
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.6, marginBottom: '16px' }}>
          Parity is engineered to never crash during live judging, even when cloud services experience outages:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-dark-subtle)' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: '6px' }}>AI Provider Chain</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary-dark)' }}>
              Google Gemini 1.5 Flash → OpenAI GPT-4o-mini fallback → Deterministic Heuristics (offline).
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-dark-subtle)' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: '6px' }}>Database Degradation</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary-dark)' }}>
              Railway PostgreSQL + pgvector → In-memory session store (honest non-persistent fallback).
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-dark-subtle)' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: '6px' }}>Zero-Dependency Demo</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary-dark)' }}>
              Instant precomputed fixtures run 100% offline without database, Redis, or API keys.
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button
          className="cta-btn-primary"
          style={{ fontSize: '15px', padding: '12px 24px' }}
          onClick={onOpenUpload}
        >
          Upload a Document →
        </button>
        <button
          className="nav-btn"
          style={{
            fontSize: '14px',
            padding: '12px 20px',
            borderColor: 'var(--border-dark)',
            backgroundColor: 'var(--bg-surface-dark)',
            color: '#fff',
          }}
          onClick={onOpenCompare}
        >
          Compare Contracts
        </button>
        <button
          className="nav-btn"
          style={{
            fontSize: '14px',
            padding: '12px 20px',
            borderColor: 'var(--border-dark)',
            backgroundColor: 'var(--bg-surface-dark)',
            color: 'var(--accent-gold)',
          }}
          onClick={onStartDemo}
        >
          Try Sample Demo
        </button>
      </div>
    </main>
  );
};
