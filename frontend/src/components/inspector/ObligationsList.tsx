import React, { useState } from 'react';
import { Obligations } from '@parity/shared';

interface ObligationsListProps {
  obligations?: Obligations | null;
  onJumpToClause: (clauseIndex: number) => void;
}

export const ObligationsList: React.FC<ObligationsListProps> = ({ obligations, onJumpToClause }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!obligations) {
    return <div className="inspector-card-content">No obligations extracted.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Your Obligations */}
      <div className="inspector-card">
        <div className="inspector-card-label" style={{ color: '#60a5fa' }}>
          ✓ Your Obligations (Signer)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {obligations.yourObligations.length === 0 ? (
            <div style={{ color: 'var(--text-muted-dark)', fontSize: '13px' }}>No specific signer obligations found.</div>
          ) : (
            obligations.yourObligations.map((o) => (
              <label
                key={o.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: checkedItems[o.id] ? 'var(--text-muted-dark)' : 'var(--text-primary-dark)',
                  textDecoration: checkedItems[o.id] ? 'line-through' : 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(checkedItems[o.id])}
                  onChange={() => toggleCheck(o.id)}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <span>{o.description}</span>
                  {o.clauseIndex && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onJumpToClause(o.clauseIndex!);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        marginLeft: '8px',
                      }}
                    >
                      (Sec {o.clauseIndex})
                    </button>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Their Obligations */}
      <div className="inspector-card">
        <div className="inspector-card-label" style={{ color: '#34d399' }}>
          ✓ Their Obligations (Counterparty)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {obligations.theirObligations.length === 0 ? (
            <div style={{ color: 'var(--text-muted-dark)', fontSize: '13px' }}>No specific counterparty obligations found.</div>
          ) : (
            obligations.theirObligations.map((o) => (
              <label
                key={o.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: checkedItems[o.id] ? 'var(--text-muted-dark)' : 'var(--text-primary-dark)',
                  textDecoration: checkedItems[o.id] ? 'line-through' : 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(checkedItems[o.id])}
                  onChange={() => toggleCheck(o.id)}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <span>{o.description}</span>
                  {o.clauseIndex && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onJumpToClause(o.clauseIndex!);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        marginLeft: '8px',
                      }}
                    >
                      (Sec {o.clauseIndex})
                    </button>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
