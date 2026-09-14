import React from 'react';

interface LegalLicensingPageProps {
  onOpenUpload: () => void;
  onOpenCompare: () => void;
}

export const LegalLicensingPage: React.FC<LegalLicensingPageProps> = ({
  onOpenUpload,
  onOpenCompare,
}) => {
  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge badge-demo" style={{ marginBottom: '16px', display: 'inline-block' }}>
          § Compliance & Transparency
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
          Legal & Licensing
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
          Parity is designed with privacy-first architecture, strict non-attorney disclaimers, and open-source licensing.
        </p>
      </div>

      {/* Section 1: Non-Attorney Legal Disclaimer */}
      <div
        className="inspector-card"
        style={{
          padding: '28px',
          marginBottom: '28px',
          borderLeft: '4px solid var(--accent-gold)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ fontSize: '20px' }}>⚖️</span>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            Legal Disclaimer & Non-Attorney Notice
          </h2>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>
            <strong>Parity is an automated GenAI legal document comprehension tool, not a law firm or a substitute for licensed legal counsel.</strong>
          </p>
          <p>
            Use of Parity does not create an attorney-client relationship, nor does it constitute legal advice or formal representation. Parity analyzes legal documents for informational purposes to help non-lawyers identify potentially hazardous clauses, understand practical consequences, and compare contract terms.
          </p>
          <p>
            Laws vary significantly by state, province, and country. Parity makes no warranties regarding the legal enforceability, validity, or completeness of its assessments or comparisons. For binding legal matters, transaction execution, or litigation, always consult a qualified attorney licensed in your relevant jurisdiction.
          </p>
        </div>
      </div>

      {/* Section 2: Data Privacy & Ephemeral Processing */}
      <div
        className="inspector-card"
        style={{
          padding: '28px',
          marginBottom: '28px',
          borderLeft: '4px solid #34d399',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ fontSize: '20px' }}>🔒</span>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            Privacy Architecture & Zero-Retention Processing
          </h2>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>
            Your legal agreements are personal and sensitive. Parity enforces strict privacy protections throughout its pipeline:
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Ephemeral Processing:</strong> Uploaded documents are processed entirely in-memory. Files are never saved to permanent disk storage on cloud containers.
            </li>
            <li>
              <strong>No AI Model Training:</strong> Document text passed through Google Gemini or OpenAI API endpoints is processed under commercial API terms with zero data retention for model retraining.
            </li>
            <li>
              <strong>Sanitized Logging:</strong> Application logs contain operational metadata only (document IDs, processing duration, similarity metrics). Verbatim document text and extracted legal contents are never logged.
            </li>
            <li>
              <strong>Prompt Injection Hardening:</strong> Uploaded documents are wrapped in strict safety boundaries (<code style={{ color: '#86efac' }}>=== BEGIN LEGAL DOCUMENT ===</code>) preventing document text from executing arbitrary LLM instructions.
            </li>
          </ul>
        </div>
      </div>

      {/* Section 3: Open-Source MIT License */}
      <div
        className="inspector-card"
        style={{
          padding: '28px',
          marginBottom: '40px',
          borderLeft: '4px solid #60a5fa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ fontSize: '20px' }}>📜</span>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            Open Source License (MIT)
          </h2>
        </div>
        <div
          style={{
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-dark)',
            borderRadius: '6px',
            padding: '18px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-secondary-dark)',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}
        >
{`MIT License

Copyright (c) 2026 Parity Project Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
        </div>
      </div>

      {/* Navigation Call to Action */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <button
          className="cta-btn-primary"
          style={{ fontSize: '15px', padding: '12px 24px' }}
          onClick={onOpenUpload}
        >
          Return to Upload →
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
      </div>
    </main>
  );
};
