import React from 'react';
import { RiskTier } from '@parity/shared';

interface RiskBadgeProps {
  tier?: RiskTier | null;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ tier, className = '' }) => {
  if (!tier) return null;

  let badgeClass = 'badge-fair';
  let icon = '✓';

  if (tier === RiskTier.RedFlag) {
    badgeClass = 'badge-flag';
    icon = '⚑';
  } else if (tier === RiskTier.WorthASecondLook) {
    badgeClass = 'badge-caution';
    icon = '▲';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`} role="status">
      <span aria-hidden="true">{icon}</span>
      <span>{tier}</span>
    </span>
  );
};

export const LiveDemoBadge: React.FC<{ isDemo: boolean }> = ({ isDemo }) => {
  return isDemo ? (
    <span className="badge badge-demo" title="Precomputed demo document for instant offline demonstration">
      Demo Document · Pre-analyzed
    </span>
  ) : (
    <span className="badge badge-live" title="Live dynamic AI analysis">
      Live Analysis
    </span>
  );
};
