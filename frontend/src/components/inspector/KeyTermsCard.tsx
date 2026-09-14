import React from 'react';
import { KeyTerms } from '@parity/shared';

interface KeyTermsCardProps {
  keyTerms?: KeyTerms | null;
}

export const KeyTermsCard: React.FC<KeyTermsCardProps> = ({ keyTerms }) => {
  if (!keyTerms) {
    return <div className="inspector-card-content">No key terms extracted.</div>;
  }

  const items = [
    { label: 'Parties', value: keyTerms.parties?.join(' & ') || 'Unspecified' },
    { label: 'Payment Terms', value: keyTerms.payment || 'Not specified' },
    { label: 'Notice Period', value: keyTerms.noticePeriod || 'Not specified' },
    { label: 'Duration / Term', value: keyTerms.duration || 'Not specified' },
    { label: 'Jurisdiction', value: keyTerms.jurisdiction || 'Not specified' },
    { label: 'Renewal', value: keyTerms.renewal || 'Not specified' },
    { label: 'Penalties', value: keyTerms.penalties || 'None specified' },
    { label: 'Security Deposit', value: keyTerms.deposit || 'None' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
      {items.map((item, idx) => (
        <div key={idx} className="inspector-card" style={{ padding: '12px 14px' }}>
          <div className="inspector-card-label" style={{ marginBottom: '4px' }}>
            {item.label}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};
