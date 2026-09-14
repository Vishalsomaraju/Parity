import React from 'react';

interface AppHeaderProps {
  currentView: 'landing' | 'workspace' | 'compare' | 'upload';
  onNavigate: (view: 'landing' | 'workspace' | 'compare' | 'upload') => void;
  onLaunchDemo: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentView, onNavigate, onLaunchDemo }) => {
  return (
    <header className="app-header" role="banner">
      <div className="brand-title" onClick={() => onNavigate('landing')} role="button" tabIndex={0}>
        <div className="brand-logo-mark" aria-hidden="true">§</div>
        <div>
          <span className="brand-name">PARITY</span>
        </div>
        <span className="brand-tagline">Know where you stand before you sign.</span>
      </div>

      <nav className="nav-links" aria-label="Main Navigation">
        <button
          className={`nav-btn ${currentView === 'landing' ? 'active' : ''}`}
          onClick={() => onNavigate('landing')}
        >
          Overview
        </button>
        <button
          className={`nav-btn ${currentView === 'workspace' ? 'active' : ''}`}
          onClick={() => onNavigate('workspace')}
        >
          Workspace
        </button>
        <button
          className={`nav-btn ${currentView === 'compare' ? 'active' : ''}`}
          onClick={() => onNavigate('compare')}
        >
          Compare Documents
        </button>
        <button
          className={`nav-btn ${currentView === 'upload' ? 'active' : ''}`}
          onClick={() => onNavigate('upload')}
        >
          Upload Document
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
