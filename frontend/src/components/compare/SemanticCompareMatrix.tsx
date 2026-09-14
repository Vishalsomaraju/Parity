import React, { useState } from 'react';
import { ComparisonResult, ComparisonVerdict, SignificanceTier } from '@parity/shared';
import { VerdictSummary } from './VerdictSummary';
import { TopicDiffCard } from './TopicDiffCard';

interface SemanticCompareMatrixProps {
  comparison: ComparisonResult;
}

export const SemanticCompareMatrix: React.FC<SemanticCompareMatrixProps> = ({ comparison }) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'missing'>('all');

  const filteredTopics = comparison.topics.filter((t) => {
    if (filter === 'high') {
      return t.significance === SignificanceTier.High;
    }
    if (filter === 'missing') {
      return t.verdict === ComparisonVerdict.OnlyInA || t.verdict === ComparisonVerdict.OnlyInB;
    }
    return true;
  });

  return (
    <div className="compare-container">
      {/* Title & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-demo" style={{ marginBottom: '8px' }}>
            Semantic Topic Alignment
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
            {comparison.labelA} <span style={{ color: 'var(--text-muted-dark)' }}>vs</span> {comparison.labelB}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary-dark)', marginTop: '4px' }}>
            Comparing contractual provisions aligned by what they mean, not section numbers.
          </p>
        </div>
      </div>

      {/* Scorecard */}
      <VerdictSummary comparison={comparison} />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '12px' }}>
        <button
          className={`nav-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Topics ({comparison.topics.length})
        </button>
        <button
          className={`nav-btn ${filter === 'high' ? 'active' : ''}`}
          onClick={() => setFilter('high')}
        >
          High Significance Discrepancies
        </button>
        <button
          className={`nav-btn ${filter === 'missing' ? 'active' : ''}`}
          onClick={() => setFilter('missing')}
        >
          Missing Protections ({comparison.summary.missingProtectionCount})
        </button>
      </div>

      {/* Topic Diff Cards */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filteredTopics.map((topic, idx) => (
          <TopicDiffCard
            key={idx}
            topic={topic}
            labelA={comparison.labelA}
            labelB={comparison.labelB}
          />
        ))}
      </div>
    </div>
  );
};
