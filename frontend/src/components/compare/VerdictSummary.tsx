import React from 'react';
import { ComparisonResult } from '@parity/shared';

interface VerdictSummaryProps {
  comparison: ComparisonResult;
}

export const VerdictSummary: React.FC<VerdictSummaryProps> = ({ comparison }) => {
  const { summary, labelA, labelB } = comparison;

  return (
    <section className="compare-scorecard" aria-label="Comparison Scorecard">
      <div className="scorecard-metric" style={{ borderTop: '3px solid #60a5fa' }}>
        <div className="scorecard-metric-num" style={{ color: '#60a5fa' }}>
          {summary.aStrongerCount}
        </div>
        <div className="scorecard-metric-label">Topics Favor {labelA}</div>
      </div>

      <div className="scorecard-metric" style={{ borderTop: '3px solid #f87171' }}>
        <div className="scorecard-metric-num" style={{ color: '#f87171' }}>
          {summary.bStrongerCount}
        </div>
        <div className="scorecard-metric-label">Topics Favor {labelB}</div>
      </div>

      <div className="scorecard-metric" style={{ borderTop: '3px solid #4ade80' }}>
        <div className="scorecard-metric-num" style={{ color: '#4ade80' }}>
          {summary.equivalentCount}
        </div>
        <div className="scorecard-metric-label">Materially Equivalent</div>
      </div>

      <div className="scorecard-metric" style={{ borderTop: '3px solid #fbbf24' }}>
        <div className="scorecard-metric-num" style={{ color: '#fbbf24' }}>
          {summary.missingProtectionCount}
        </div>
        <div className="scorecard-metric-label">Missing Protections</div>
      </div>
    </section>
  );
};
