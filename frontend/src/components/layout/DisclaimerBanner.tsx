import React from 'react';
import { LEGAL_DISCLAIMER } from '@parity/shared';

export const DisclaimerBanner: React.FC = () => {
  return (
    <aside className="disclaimer-banner" role="note" aria-label="Legal Disclaimer">
      <span aria-hidden="true">⚖️</span>
      <span>{LEGAL_DISCLAIMER}</span>
    </aside>
  );
};
