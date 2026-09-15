import React, { useState, useEffect } from 'react';
import type { Document, Clause, QAResponse } from '@parity/shared';
import { RiskTier } from '@parity/shared';
import { DocumentViewer } from '../components/document/DocumentViewer';
import { ParityInspector } from '../components/inspector/ParityInspector';
import { RiskBadge } from '../components/document/RiskBadge';

interface ResultsPageProps {
  document: Document | null;
  clauses: Clause[];
  demoQAMap?: Record<string, QAResponse>;
  onSwitchDocument?: (docId: string) => void;
  onNavigateUpload: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  document,
  clauses,
  demoQAMap,
  onSwitchDocument,
  onNavigateUpload,
}) => {
  const [selectedClause, setSelectedClause] = useState<Clause | null>(clauses[0] || null);

  useEffect(() => {
    // Lazily inject Lora serif font only when entering document results
    if (!window.document.getElementById('font-lora')) {
      const link = window.document.createElement('link');
      link.id = 'font-lora';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,400&display=swap';
      window.document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (clauses.length > 0 && (!selectedClause || !clauses.find((c) => c.id === selectedClause.id))) {
      setSelectedClause(clauses[0]);
    }
  }, [clauses, selectedClause]);

  if (!document) {
    return (
      <main
        style={{
          maxWidth: '600px',
          margin: '80px auto',
          textAlign: 'center',
          padding: '40px 24px',
          backgroundColor: 'var(--bg-surface-dark)',
          border: '1px solid var(--border-dark)',
          borderRadius: '8px',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
          No Document Analyzed Yet
        </h2>
        <p style={{ color: 'var(--text-secondary-dark)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
          Upload a contract or try one of our instant sample agreements to review risk scores, plain-English translations, and key obligations.
        </p>
        <button
          className="cta-btn-primary"
          style={{ padding: '12px 24px', fontSize: '14px' }}
          onClick={onNavigateUpload}
        >
          Upload a Document →
        </button>
      </main>
    );
  }

  const fairCount = clauses.filter((c) => c.riskTier === RiskTier.Fair).length;
  const cautionCount = clauses.filter((c) => c.riskTier === RiskTier.WorthASecondLook).length;
  const flagCount = clauses.filter((c) => c.riskTier === RiskTier.RedFlag).length;

  const handleSelectClause = (clause: Clause) => {
    setSelectedClause(clause);
    const element = window.document.getElementById(`clause-${clause.clauseIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleJumpToIndex = (clauseIndex: number) => {
    const target = clauses.find((c) => c.clauseIndex === clauseIndex);
    if (target) {
      handleSelectClause(target);
    }
  };

  const handleJumpToId = (clauseId: string) => {
    const target = clauses.find((c) => c.id === clauseId);
    if (target) {
      handleSelectClause(target);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--header-height) - 100px)' }}>
      {/* Top Results Overview Bar */}
      <header
        style={{
          backgroundColor: 'var(--bg-surface-dark)',
          borderBottom: '1px solid var(--border-dark)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="nav-btn"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={onNavigateUpload}
          >
            ← Upload Another
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: '#fff', fontSize: '15px' }}>{document.filename}</span>
            <span className="badge badge-demo" style={{ fontSize: '10px' }}>
              {document.documentType}
            </span>
          </div>
        </div>

        {/* Risk Breakdown Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted-dark)' }}>{clauses.length} Clauses:</span>
          <span className="badge badge-fair" style={{ fontSize: '10px', padding: '2px 8px' }}>
            {fairCount} Standard
          </span>
          {cautionCount > 0 && (
            <span className="badge badge-caution" style={{ fontSize: '10px', padding: '2px 8px' }}>
              {cautionCount} Caution
            </span>
          )}
          {flagCount > 0 && (
            <span className="badge badge-flag" style={{ fontSize: '10px', padding: '2px 8px' }}>
              {flagCount} Red Flags
            </span>
          )}
        </div>
      </header>

      {/* 3-Zone Interactive Layout */}
      <div className="workspace-container">
        {/* Zone 1: Navigation Sidebar */}
        <nav className="zone-nav" aria-label="Document Section Navigation">
          <div>
            <div className="nav-section-title">DOCUMENT OVERVIEW</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                className="zone-nav-item active"
                onClick={() => {
                  const el = window.document.querySelector('.paper-header');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Summary & Metadata</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted-dark)' }}>{clauses.length} clauses</span>
              </div>
            </div>
          </div>

          {/* Clauses Index */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="nav-section-title" style={{ marginTop: '14px' }}>
              CLAUSE INDEX ({clauses.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
              {clauses.map((c) => {
                const isSelected = selectedClause?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`zone-nav-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectClause(c)}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.clauseIndex}. {c.clauseType}
                    </span>
                    <RiskBadge tier={c.riskTier} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Sample Switcher */}
          {onSwitchDocument && (
            <div style={{ borderTop: '1px solid var(--border-dark)', paddingTop: '12px', marginTop: 'auto' }}>
              <div className="nav-section-title">SAMPLE DOCUMENTS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  className="nav-btn"
                  style={{ textAlign: 'left', fontSize: '12px', padding: '6px 10px' }}
                  onClick={() => onSwitchDocument('demo_freelance_standard')}
                >
                  Standard Freelance (Fair)
                </button>
                <button
                  className="nav-btn"
                  style={{ textAlign: 'left', fontSize: '12px', padding: '6px 10px' }}
                  onClick={() => onSwitchDocument('demo_freelance_aggressive')}
                >
                  Omnicorp Agreement (Predatory)
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Zone 2: Ink-on-Paper Document Canvas */}
        <main className="zone-document" aria-label="Document Reader">
          <DocumentViewer
            document={document}
            clauses={clauses}
            selectedClauseId={selectedClause?.id || null}
            onSelectClause={handleSelectClause}
          />
        </main>

        {/* Zone 3: Parity Inspector */}
        <ParityInspector
          document={document}
          selectedClause={selectedClause}
          onJumpToClauseIndex={handleJumpToIndex}
          onJumpToClauseId={handleJumpToId}
          demoQAMap={demoQAMap}
        />
      </div>
    </div>
  );
};
