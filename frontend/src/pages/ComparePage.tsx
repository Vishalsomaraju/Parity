import React, { useState } from 'react';
import { ComparisonResult } from '@parity/shared';
import { SemanticCompareMatrix } from '../components/compare/SemanticCompareMatrix';
import { DEMO_FREELANCE_COMPARISON, DEMO_LEASE_COMPARISON } from '../data/demoFixtures';

interface ComparePageProps {
  initialComparison?: ComparisonResult;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  initialComparison = DEMO_FREELANCE_COMPARISON,
}) => {
  const [activeComparison, setActiveComparison] = useState<ComparisonResult>(initialComparison);

  return (
    <main style={{ minHeight: 'calc(100vh - var(--header-height) - 34px)', backgroundColor: 'var(--bg-app)' }}>
      {/* Preset Comparison Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface-dark)',
          borderBottom: '1px solid var(--border-dark)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted-dark)', textTransform: 'uppercase' }}>
          Select Comparison:
        </span>
        <button
          className={`nav-btn ${activeComparison.id === 'demo_cmp_freelance' ? 'active' : ''}`}
          onClick={() => setActiveComparison(DEMO_FREELANCE_COMPARISON)}
        >
          Freelance: Standard vs Omnicorp Aggressive
        </button>
        <button
          className={`nav-btn ${activeComparison.id === 'demo_cmp_lease' ? 'active' : ''}`}
          onClick={() => setActiveComparison(DEMO_LEASE_COMPARISON)}
        >
          Residential Lease: Standard vs Metro Restrictive
        </button>
      </div>

      {/* Comparison Matrix */}
      <SemanticCompareMatrix comparison={activeComparison} />
    </main>
  );
};
