import React from 'react';

interface LandingPageProps {
  onStartDemo: () => void;
  onOpenUpload: () => void;
  onOpenCompare: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDemo,
  onOpenUpload,
  onOpenCompare,
}) => {
  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 24px' }}>
      {/* Editorial Hero */}
      <section style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="badge badge-demo" style={{ fontSize: '12px', padding: '6px 14px' }}>
            § Legal Intelligence for Non-Lawyers
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-1px',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            marginBottom: '24px',
          }}
        >
          LEGAL DOCUMENTS
          <br />
          SHOULDN’T REQUIRE
          <br />
          <span style={{ color: 'var(--accent-gold)' }}>A LAW DEGREE.</span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--text-secondary-dark)',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6,
          }}
        >
          Know where you stand before you sign. Parity translates dense legalese into plain-English consequences, surfaces hidden risks, and aligns contracts side-by-side.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            className="cta-btn-primary"
            style={{ fontSize: '16px', padding: '14px 28px' }}
            onClick={onStartDemo}
          >
            Try Interactive Demo →
          </button>
          <button
            className="nav-btn"
            style={{
              fontSize: '15px',
              padding: '14px 24px',
              borderColor: 'var(--border-dark)',
              backgroundColor: 'var(--bg-surface-dark)',
              color: '#fff',
            }}
            onClick={onOpenCompare}
          >
            Compare Two Documents
          </button>
          <button
            className="nav-btn"
            style={{
              fontSize: '15px',
              padding: '14px 24px',
              borderColor: 'var(--border-dark)',
              backgroundColor: 'var(--bg-surface-dark)',
              color: '#fff',
            }}
            onClick={onOpenUpload}
          >
            Analyze Your Document
          </button>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '64px' }}>
        <div className="inspector-card" style={{ padding: '24px', borderTop: '3px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>📖</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            Fine Print, Translated
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.6 }}>
            Rather than generic risk scores, Parity translates gotchas into blunt real-world headlines: <em>"You forfeit all unpaid work if they cancel"</em> or <em>"Your financial liability has no ceiling."</em>
          </p>
        </div>

        <div className="inspector-card" style={{ padding: '24px', borderTop: '3px solid #60a5fa' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚖️</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            Document-vs-Document Compare
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.6 }}>
            Deciding between two job offers, leases, or vendor agreements? Parity semantically aligns clauses across 20 canonical legal categories, exposing asymmetric liability shifts and missing protections.
          </p>
        </div>

        <div className="inspector-card" style={{ padding: '24px', borderTop: '3px solid #34d399' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎯</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            Grounded Anti-Hallucination Q&A
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.6 }}>
            Ask questions with zero risk of fabricated legal doctrines. Every grounded response cites the exact clause, page number, and verbatim excerpt, and admits when evidence is insufficient.
          </p>
        </div>
      </section>

      {/* Primary Loop Diagram */}
      <section style={{ backgroundColor: 'var(--bg-surface-dark)', border: '1px solid var(--border-dark)', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted-dark)', marginBottom: '16px' }}>
          The Parity Decision Loop
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
          <span>UPLOAD</span>
          <span style={{ color: 'var(--accent-gold)' }}>→</span>
          <span>UNDERSTAND</span>
          <span style={{ color: 'var(--accent-gold)' }}>→</span>
          <span>FIND WHAT MATTERS</span>
          <span style={{ color: 'var(--accent-gold)' }}>→</span>
          <span>COMPARE OPTIONS</span>
          <span style={{ color: 'var(--accent-gold)' }}>→</span>
          <span>DECIDE NEXT STEPS</span>
        </div>
      </section>
    </main>
  );
};
