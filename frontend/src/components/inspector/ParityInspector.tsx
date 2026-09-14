import React, { useState } from 'react';
import { Clause, Document, QAResponse } from '@parity/shared';
import { RiskBadge } from '../document/RiskBadge';
import { FinePrintCard } from './FinePrintCard';
import { ObligationsList } from './ObligationsList';
import { TimelineView } from './TimelineView';
import { KeyTermsCard } from './KeyTermsCard';
import { ContextualChat } from '../qa/ContextualChat';

interface ParityInspectorProps {
  document: Document;
  selectedClause: Clause | null;
  onJumpToClauseIndex: (clauseIndex: number) => void;
  onJumpToClauseId: (clauseId: string) => void;
  demoQAMap?: Record<string, QAResponse>;
}

export const ParityInspector: React.FC<ParityInspectorProps> = ({
  document,
  selectedClause,
  onJumpToClauseIndex,
  onJumpToClauseId,
  demoQAMap,
}) => {
  const [activeTab, setActiveTab] = useState<'clause' | 'fineprint' | 'obligations' | 'timeline' | 'terms' | 'qa'>(
    'clause'
  );

  return (
    <aside className="zone-inspector" aria-label="Parity Intelligence Inspector">
      <div className="inspector-header">
        <span className="inspector-title">PARITY INTELLIGENCE</span>
        {selectedClause?.riskTier && <RiskBadge tier={selectedClause.riskTier} />}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-dark)',
          backgroundColor: 'var(--bg-surface-elevated)',
          overflowX: 'auto',
        }}
      >
        <button
          className={`nav-btn ${activeTab === 'clause' ? 'active' : ''}`}
          style={{ borderRadius: 0, padding: '10px 14px', fontSize: '12px' }}
          onClick={() => setActiveTab('clause')}
        >
          Clause
        </button>
        <button
          className={`nav-btn ${activeTab === 'fineprint' ? 'active' : ''}`}
          style={{ borderRadius: 0, padding: '10px 14px', fontSize: '12px' }}
          onClick={() => setActiveTab('fineprint')}
        >
          Fine Print ({document.finePrint?.length || 0})
        </button>
        <button
          className={`nav-btn ${activeTab === 'obligations' ? 'active' : ''}`}
          style={{ borderRadius: 0, padding: '10px 14px', fontSize: '12px' }}
          onClick={() => setActiveTab('obligations')}
        >
          Duties
        </button>
        <button
          className={`nav-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          style={{ borderRadius: 0, padding: '10px 14px', fontSize: '12px' }}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button
          className={`nav-btn ${activeTab === 'terms' ? 'active' : ''}`}
          style={{ borderRadius: 0, padding: '10px 14px', fontSize: '12px' }}
          onClick={() => setActiveTab('terms')}
        >
          Terms
        </button>
        <button
          className={`nav-btn ${activeTab === 'qa' ? 'active' : ''}`}
          style={{ borderRadius: 0, padding: '10px 14px', fontSize: '12px' }}
          onClick={() => setActiveTab('qa')}
        >
          Q&A
        </button>
      </div>

      {/* Tab Body */}
      <div className="inspector-body">
        {activeTab === 'clause' && (
          <>
            {selectedClause ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div className="inspector-card-label">Selected Clause</div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                    {selectedClause.sectionTitle || `Section ${selectedClause.clauseIndex}`}
                  </h2>
                </div>

                {/* 1. What the document says */}
                <div className="inspector-card">
                  <div className="inspector-card-label">1. What the document says</div>
                  <blockquote
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: '#cbd5e1',
                      borderLeft: '2px solid var(--border-dark)',
                      paddingLeft: '10px',
                    }}
                  >
                    "{selectedClause.clauseText}"
                  </blockquote>
                </div>

                {/* 2. What this could mean for you */}
                <div className="inspector-card" style={{ borderLeft: '3px solid var(--accent-gold)' }}>
                  <div className="inspector-card-label">2. What this means for you</div>
                  <div className="inspector-card-content" style={{ fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                    {selectedClause.plainMeaning || 'Terms governing this section of the agreement.'}
                  </div>
                  <div className="inspector-card-content" style={{ color: 'var(--text-secondary-dark)' }}>
                    {selectedClause.whyItMatters || selectedClause.riskExplanation}
                  </div>
                </div>

                {/* 3. What Parity cannot determine */}
                <div className="inspector-card" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div className="inspector-card-label">3. What Parity cannot determine</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted-dark)', lineHeight: 1.5 }}>
                    Parity explains language and market patterns, but cannot determine statutory enforceability in your local jurisdiction or replace legal counsel.
                  </p>
                </div>

                {selectedClause.reasonCodes && selectedClause.reasonCodes.length > 0 && (
                  <div>
                    <div className="inspector-card-label">Reason Codes</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedClause.reasonCodes.map((code, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            color: 'var(--accent-gold)',
                          }}
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted-dark)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📜</div>
                <p>Click any clause on the left document sheet to inspect its plain-English meaning and risk breakdown.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'fineprint' && (
          <div>
            <div className="inspector-card-label" style={{ marginBottom: '12px' }}>
              Fine Print, Translated ({document.finePrint?.length || 0} findings)
            </div>
            {document.finePrint?.map((fp) => (
              <FinePrintCard key={fp.id} item={fp} onJumpToClause={onJumpToClauseIndex} />
            ))}
          </div>
        )}

        {activeTab === 'obligations' && (
          <ObligationsList obligations={document.obligations} onJumpToClause={onJumpToClauseIndex} />
        )}

        {activeTab === 'timeline' && <TimelineView timeline={document.timeline} />}

        {activeTab === 'terms' && <KeyTermsCard keyTerms={document.keyTerms} />}

        {activeTab === 'qa' && (
          <ContextualChat
            documentId={document.id}
            isDemo={document.isDemo}
            onJumpToClauseById={onJumpToClauseId}
            demoQAMap={demoQAMap}
          />
        )}
      </div>
    </aside>
  );
};
