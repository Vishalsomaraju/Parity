import React, { useState } from 'react';
import { Document, Clause, QAResponse } from '@parity/shared';
import { DocumentViewer } from '../components/document/DocumentViewer';
import { ParityInspector } from '../components/inspector/ParityInspector';
import { RiskBadge } from '../components/document/RiskBadge';

interface WorkspacePageProps {
  document: Document;
  clauses: Clause[];
  demoQAMap?: Record<string, QAResponse>;
  onSwitchDocument?: (docId: string) => void;
  onNavigateUpload?: () => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  document,
  clauses,
  demoQAMap,
  onSwitchDocument,
  onNavigateUpload,
}) => {
  const [selectedClause, setSelectedClause] = useState<Clause | null>(clauses[0] || null);

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
    <div className="workspace-container">
      {/* Zone 1: Navigation Sidebar */}
      <nav className="zone-nav" aria-label="Document Section Navigation">
        {onNavigateUpload && (
          <div style={{ marginBottom: '16px' }}>
            <button
              className="cta-btn-primary"
              style={{ width: '100%', fontSize: '12px', padding: '8px 12px' }}
              onClick={onNavigateUpload}
            >
              ← Upload New Document
            </button>
          </div>
        )}
        <div>
          <div className="nav-section-title">DOCUMENT NAVIGATION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              className="zone-nav-item active"
              onClick={() => {
                const el = window.document.querySelector('.paper-header');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Overview & Document Details</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted-dark)' }}>{clauses.length} clauses</span>
            </div>
          </div>
        </div>

        {/* Clauses Index */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="nav-section-title" style={{ marginTop: '12px' }}>
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

        {/* Quick Document Switcher */}
        {onSwitchDocument && (
          <div style={{ borderTop: '1px solid var(--border-dark)', paddingTop: '12px' }}>
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
  );
};
