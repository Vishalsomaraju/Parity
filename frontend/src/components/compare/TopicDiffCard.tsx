import React from 'react';
import { ComparisonTopic, ComparisonVerdict, SignificanceTier } from '@parity/shared';

interface TopicDiffCardProps {
  topic: ComparisonTopic;
  labelA: string;
  labelB: string;
}

export const TopicDiffCard: React.FC<TopicDiffCardProps> = ({ topic, labelA, labelB }) => {
  let verdictColor = '#4ade80';
  if (topic.verdict === ComparisonVerdict.ABetter) verdictColor = '#60a5fa';
  else if (topic.verdict === ComparisonVerdict.BBetter) verdictColor = '#f87171';
  else if (topic.verdict === ComparisonVerdict.OnlyInA || topic.verdict === ComparisonVerdict.OnlyInB) {
    verdictColor = '#fbbf24';
  }

  let sigBadgeColor = 'rgba(255,255,255,0.1)';
  if (topic.significance === SignificanceTier.High) sigBadgeColor = 'rgba(220, 38, 38, 0.2)';
  else if (topic.significance === SignificanceTier.Medium) sigBadgeColor = 'rgba(217, 119, 6, 0.2)';

  return (
    <article className="topic-compare-card" aria-label={`Comparison for ${topic.topic}`}>
      {/* Header */}
      <header className="topic-compare-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{topic.topic}</h3>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '3px',
              backgroundColor: sigBadgeColor,
              color: topic.significance === SignificanceTier.High ? '#f87171' : '#fbbf24',
            }}
          >
            {topic.significance} Significance
          </span>
        </div>

        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0,0,0,0.4)',
            color: verdictColor,
            border: `1px solid ${verdictColor}`,
          }}
        >
          {topic.verdict.toUpperCase()}
        </span>
      </header>

      {/* Side-by-side text */}
      <div className="topic-compare-grid">
        <div className="topic-doc-column">
          <div className="topic-doc-label">{labelA}</div>
          <div className="topic-doc-text">
            {topic.docAText ? `"${topic.docAText}"` : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>[Omitted from {labelA}]</span>}
          </div>
        </div>

        <div className="topic-doc-column" style={{ borderLeft: '1px solid var(--border-dark)' }}>
          <div className="topic-doc-label">{labelB}</div>
          <div className="topic-doc-text">
            {topic.docBText ? `"${topic.docBText}"` : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>[Omitted from {labelB}]</span>}
          </div>
        </div>
      </div>

      {/* Verdict & Impact */}
      <footer className="topic-verdict-banner">
        <div style={{ fontSize: '18px' }} aria-hidden="true">💡</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
            {topic.keyDifference || 'Topic Assessment'}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary-dark)', lineHeight: 1.5 }}>
            {topic.explanation}
          </div>
        </div>
      </footer>
    </article>
  );
};
