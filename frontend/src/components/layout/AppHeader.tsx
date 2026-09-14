import React from 'react';

interface AppHeaderProps {
  currentView: 'upload' | 'workspace' | 'compare' | 'how-it-works' | 'legal';
  onNavigate: (view: 'upload' | 'workspace' | 'compare' | 'how-it-works' | 'legal') => void;
  onLaunchDemo: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentView, onNavigate, onLaunchDemo }) => {
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
          className={`nav-btn ${currentView === 'workspace' ? 'active' : ''}`}
          onClick={() => onNavigate('workspace')}
        >
          Results
        </button>
        <button
          className={`nav-btn ${currentView === 'compare' ? 'active' : ''}`}
          onClick={() => onNavigate('compare')}
        >
          Compare Contracts
        </button>
        <button
          className={`nav-btn ${currentView === 'how-it-works' ? 'active' : ''}`}
          onClick={() => onNavigate('how-it-works')}
        >
          How It Works
        </button>
        <button
          className={`nav-btn ${currentView === 'legal' ? 'active' : ''}`}
          onClick={() => onNavigate('legal')}
        >
          Legal & Licensing
        </button>
        <button
          className="cta-btn-primary"
          onClick={onLaunchDemo}
          title="Instant 1-click interactive demo"
        >
          Try Demo →
        </button>
      </nav>
    </header>
  );
};
