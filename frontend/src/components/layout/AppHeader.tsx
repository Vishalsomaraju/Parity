import React from 'react';

interface AppHeaderProps {
  currentView: 'upload' | 'results' | 'how-it-works';
  onNavigate: (view: 'upload' | 'results' | 'how-it-works') => void;
  onLaunchDemo: () => void;
  hasActiveDocument?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  onNavigate,
  onLaunchDemo,
  hasActiveDocument = false,
}) => {
  return (
    <header className="app-header" role="banner">
      <div
        className="brand-title"
        onClick={() => onNavigate('upload')}
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
        title="Parity Home — Upload Document"
      >
        <div className="brand-logo-mark" aria-hidden="true">§</div>
        <div>
          <span className="brand-name">PARITY</span>
        </div>
        <span className="brand-tagline">Know where you stand before you sign.</span>
      </div>

      <nav className="nav-links" aria-label="Main Navigation">
        <button
          className={`nav-btn ${currentView === 'upload' ? 'active' : ''}`}
          onClick={() => onNavigate('upload')}
        >
          Upload Document
        </button>
        <button
          className={`nav-btn ${currentView === 'results' ? 'active' : ''}`}
          onClick={() => onNavigate('results')}
          title={hasActiveDocument ? 'View analyzed results' : 'No document analyzed yet'}
        >
          Results {hasActiveDocument && <span style={{ fontSize: '9px', color: 'var(--accent-gold)' }}>●</span>}
        </button>
        <button
          className={`nav-btn ${currentView === 'how-it-works' ? 'active' : ''}`}
          onClick={() => onNavigate('how-it-works')}
        >
          How It Works
        </button>
        <button
          className="cta-btn-primary"
          onClick={onLaunchDemo}
          title="Instant 1-click interactive demo"
          style={{ fontSize: '13px', padding: '7px 16px' }}
        >
          Try Demo →
        </button>
      </nav>
    </header>
  );
};

