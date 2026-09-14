import React from 'react';

interface AppFooterProps {
  currentView: 'upload' | 'workspace' | 'compare' | 'how-it-works' | 'legal';
  onNavigate: (view: 'upload' | 'workspace' | 'compare' | 'how-it-works' | 'legal') => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ currentView, onNavigate }) => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-surface-dark)',
        borderTop: '1px solid var(--border-dark)',
        padding: '36px 24px',
        marginTop: 'auto',
      }}
      role="contentinfo"
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Brand & Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: 'var(--accent-gold)',
                color: '#121316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '14px',
                borderRadius: '3px',
              }}
            >
              §
            </div>
            <div>
              <span style={{ fontWeight: 900, letterSpacing: '1px', color: '#fff', fontSize: '14px' }}>
                PARITY
              </span>
              <span style={{ color: 'var(--text-muted-dark)', fontSize: '12px', marginLeft: '8px' }}>
                Know where you stand before you sign.
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav
            style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}
            aria-label="Footer Navigation"
          >
            <button
              onClick={() => onNavigate('upload')}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'upload' ? 'var(--accent-gold)' : 'var(--text-secondary-dark)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Upload Document
            </button>
            <button
              onClick={() => onNavigate('workspace')}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'workspace' ? 'var(--accent-gold)' : 'var(--text-secondary-dark)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Results
            </button>
            <button
              onClick={() => onNavigate('compare')}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'compare' ? 'var(--accent-gold)' : 'var(--text-secondary-dark)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Compare Contracts
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'how-it-works' ? 'var(--accent-gold)' : 'var(--text-secondary-dark)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigate('legal')}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'legal' ? 'var(--accent-gold)' : 'var(--text-secondary-dark)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Legal & Licensing
            </button>
          </nav>
        </div>

        {/* Bottom Metadata & Legal Disclaimer */}
        <div
          style={{
            borderTop: '1px solid var(--border-dark-subtle)',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '11px',
            color: 'var(--text-muted-dark)',
          }}
        >
          <div>
            PromptWars 2026 · AI for Legal Assistance & Access · Open Source (MIT License)
          </div>
          <div>
            Parity is an automated legal comprehension tool and does not provide legal advice or attorney representation.
          </div>
        </div>
      </div>
    </footer>
  );
};
