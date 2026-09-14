import React, { useState, Suspense, lazy } from 'react';
import { Document, Clause, QAResponse } from '@parity/shared';
import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { UploadPage } from './pages/UploadPage';
import { apiUrl } from './config';

// Lazy-load non-root pages to drastically reduce initial JS bundle & accelerate FCP/LCP
const WorkspacePage = lazy(() =>
  import('./pages/WorkspacePage').then((m) => ({ default: m.WorkspacePage }))
);
const ComparePage = lazy(() =>
  import('./pages/ComparePage').then((m) => ({ default: m.ComparePage }))
);
const HowItWorksPage = lazy(() =>
  import('./pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage }))
);
const LegalLicensingPage = lazy(() =>
  import('./pages/LegalLicensingPage').then((m) => ({ default: m.LegalLicensingPage }))
);

export type AppView = 'upload' | 'workspace' | 'compare' | 'how-it-works' | 'legal';

export const App: React.FC = () => {
  // Root view is directly the Upload Document interface
  const [currentView, setCurrentView] = useState<AppView>('upload');
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [activeClauses, setActiveClauses] = useState<Clause[]>([]);
  const [demoQAMap, setDemoQAMap] = useState<Record<string, QAResponse>>({});

  const handleLaunchDemo = async () => {
    const { DEMO_FREELANCE_STANDARD, DEMO_QA_MAP } = await import('./data/demoFixtures');
    setActiveDocument(DEMO_FREELANCE_STANDARD.document);
    setActiveClauses(DEMO_FREELANCE_STANDARD.clauses);
    setDemoQAMap(DEMO_QA_MAP);
    setCurrentView('workspace');
  };

  const handleSelectDocument = async (docId: string) => {
    if (docId === 'demo_freelance_standard') {
      const { DEMO_FREELANCE_STANDARD, DEMO_QA_MAP } = await import('./data/demoFixtures');
      setActiveDocument(DEMO_FREELANCE_STANDARD.document);
      setActiveClauses(DEMO_FREELANCE_STANDARD.clauses);
      setDemoQAMap(DEMO_QA_MAP);
      setCurrentView('workspace');
      return;
    }
    if (docId === 'demo_freelance_aggressive') {
      const { DEMO_FREELANCE_AGGRESSIVE, DEMO_QA_MAP } = await import('./data/demoFixtures');
      setActiveDocument(DEMO_FREELANCE_AGGRESSIVE.document);
      setActiveClauses(DEMO_FREELANCE_AGGRESSIVE.clauses);
      setDemoQAMap(DEMO_QA_MAP);
      setCurrentView('workspace');
      return;
    }

    // Attempt to load from API if uploaded document
    try {
      const [docRes, clausesRes] = await Promise.all([
        fetch(apiUrl(`/api/documents/${docId}`)),
        fetch(apiUrl(`/api/documents/${docId}/clauses`)),
      ]);
      if (docRes.ok && clausesRes.ok) {
        const docData = await docRes.json();
        const clausesData = await clausesRes.json();
        setActiveDocument(docData);
        setActiveClauses(clausesData);
        setCurrentView('workspace');
      }
    } catch {
      // Keep active
    }
  };

  const handleDocumentProcessed = async (doc: Document) => {
    try {
      const clausesRes = await fetch(apiUrl(`/api/documents/${doc.id}/clauses`));
      if (clausesRes.ok) {
        const clauses: Clause[] = await clausesRes.json();
        setActiveDocument(doc);
        setActiveClauses(clauses);
        setCurrentView('workspace');
      }
    } catch (err) {
      console.error('Failed to load clauses for processed document:', err);
    }
  };

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DisclaimerBanner />
      <AppHeader
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onLaunchDemo={handleLaunchDemo}
      />

      <div style={{ flex: 1 }}>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                color: 'var(--text-secondary-dark)',
                fontSize: '14px',
              }}
            >
              Loading view...
            </div>
          }
        >
          {currentView === 'upload' && (
            <UploadPage
              onDocumentProcessed={handleDocumentProcessed}
              onLoadSample={(key) => handleSelectDocument(key)}
            />
          )}

          {currentView === 'workspace' && activeDocument && (
            <WorkspacePage
              document={activeDocument}
              clauses={activeClauses}
              demoQAMap={demoQAMap}
              onSwitchDocument={handleSelectDocument}
              onNavigateUpload={() => setCurrentView('upload')}
            />
          )}

          {currentView === 'workspace' && !activeDocument && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary-dark)' }}>
              <p style={{ marginBottom: '16px' }}>No document is currently active.</p>
              <button className="cta-btn-primary" onClick={() => setCurrentView('upload')}>
                Upload a Document →
              </button>
            </div>
          )}

          {currentView === 'compare' && <ComparePage />}

          {currentView === 'how-it-works' && (
            <HowItWorksPage
              onOpenUpload={() => setCurrentView('upload')}
              onOpenCompare={() => setCurrentView('compare')}
              onStartDemo={handleLaunchDemo}
            />
          )}

          {currentView === 'legal' && (
            <LegalLicensingPage
              onOpenUpload={() => setCurrentView('upload')}
              onOpenCompare={() => setCurrentView('compare')}
            />
          )}
        </Suspense>
      </div>

      <AppFooter
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />
    </div>
  );
};

export default App;
