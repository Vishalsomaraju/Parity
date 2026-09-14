import React from 'react';
import { FinePrintItem } from '@parity/shared';
import { RiskBadge } from '../document/RiskBadge';

interface FinePrintCardProps {
  item: FinePrintItem;
  onJumpToClause: (clauseIndex: number) => void;
}

export const FinePrintCard: React.FC<FinePrintCardProps> = ({ item, onJumpToClause }) => {
  const tierClass = `tier-${item.tier.replace(/\s+/g, '')}`;

  return (
    <div className={`fine-print-card ${tierClass}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h3 className="fine-print-headline">{item.title}</h3>
        <RiskBadge tier={item.tier} />
      </div>
      <p className="fine-print-explanation">{item.explanation}</p>
      <div style={{ marginTop: '12px' }}>
        <button
          className="nav-btn"
          style={{ padding: '4px 10px', fontSize: '12px', borderColor: 'var(--border-dark)' }}
          onClick={() => onJumpToClause(item.relatedClauseIndex)}
        >
          See Section {item.relatedClauseIndex} →
        </button>
      </div>
    </div>
  );
};
