import React from 'react';
import { Clause, Document } from '@parity/shared';
import { RiskBadge, LiveDemoBadge } from './RiskBadge';

interface DocumentViewerProps {
  document: Document;
  clauses: Clause[];
  selectedClauseId: string | null;
  onSelectClause: (clause: Clause) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  clauses,
  selectedClauseId,
  onSelectClause,
}) => {
  return (
    <article className="legal-document-paper" aria-label="Legal Document Reader">
      <header className="paper-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="paper-doc-type">{document.documentType.replace('_', ' ')}</span>
          <LiveDemoBadge isDemo={document.isDemo} />
        </div>
        <h1 className="paper-title">{document.filename.replace(/\.[^/.]+$/, '')}</h1>
      </header>

      <section className="clauses-container">
        {clauses.map((clause) => {
          const isSelected = selectedClauseId === clause.id;
          const riskClass = clause.riskTier ? `risk-${clause.riskTier.replace(/\s+/g, '')}` : '';

          return (
            <div
              key={clause.id}
              id={`clause-${clause.clauseIndex}`}
              className={`clause-block ${riskClass} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectClause(clause)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectClause(clause);
                }
              }}
              aria-label={`Clause ${clause.clauseIndex}: ${clause.clauseType}`}
            >
              <div className="clause-header-row">
                <span className="clause-number-title">
                  {clause.sectionTitle || `Section ${clause.clauseIndex}: ${clause.clauseType}`}
                </span>
                <RiskBadge tier={clause.riskTier} />
              </div>
              <p className="clause-body-text">{clause.clauseText}</p>
            </div>
          );
        })}
      </section>
    </article>
  );
};
