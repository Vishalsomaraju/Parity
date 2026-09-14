import React from 'react';
import { TimelineItem } from '@parity/shared';

interface TimelineViewProps {
  timeline: TimelineItem[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <div className="inspector-card-content">No specific timeline milestones extracted.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {timeline.map((item, idx) => {
        let typeBadgeColor = '#60a5fa';
        if (item.type === 'explicit_date') typeBadgeColor = '#c29d59';
        else if (item.type === 'inferred') typeBadgeColor = '#9da3b4';

        return (
          <div key={item.id || idx} className="inspector-card" style={{ borderLeft: `3px solid ${typeBadgeColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{item.milestone}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: typeBadgeColor,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}
              >
                {item.timing}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary-dark)', lineHeight: 1.5 }}>
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
