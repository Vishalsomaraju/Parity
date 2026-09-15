import React, { useState, useEffect, Suspense, lazy } from 'react';
import type { Document, Clause, QAResponse } from '@parity/shared';
import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { UploadPage } from './pages/UploadPage';
import { apiUrl } from './config';

// Lazy-load non-root pages to drastically reduce initial JS bundle & accelerate FCP/LCP
const ResultsPage = lazy(() =>
  import('./pages/ResultsPage').then((m) => ({ default: m.ResultsPage }))
);
const HowItWorksPage = lazy(() =>
  import('./pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage }))
);

export type AppView = 'upload' | 'results' | 'how-it-works';

export const App: React.FC = () => {
  // Root view is directly the Upload Document interface
  const [currentView, setCurrentView] = useState<AppView>('upload');
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [activeClauses, setActiveClauses] = useState<Clause[]>([]);
  const [demoQAMap, setDemoQAMap] = useState<Record<string, QAResponse>>({});

  // Background warm-up via requestIdleCallback after initial paint
  useEffect(() => {
    const idleCallback =
      (window as any).requestIdleCallback ||
      ((cb: () => void) => setTimeout(cb, 1500));
    const handle = idleCallback(() => {
      import('./pages/ResultsPage');
      import('./data/demoFixtures');
    });
    return () => {
      if ((window as any).cancelIdleCallback) {
        (window as any).cancelIdleCallback(handle);
      }
    };
  }, []);

  const handleLaunchDemo = async () => {
    const { DEMO_FREELANCE_STANDARD, DEMO_QA_MAP } = await import('./data/demoFixtures');
    setActiveDocument(DEMO_FREELANCE_STANDARD.document);
    setActiveClauses(DEMO_FREELANCE_STANDARD.clauses);
    setDemoQAMap(DEMO_QA_MAP);
    setCurrentView('results');
  };

  const handleSelectDocument = async (docId: string) => {
    if (docId === 'demo_freelance_standard') {
      const { DEMO_FREELANCE_STANDARD, DEMO_QA_MAP } = await import('./data/demoFixtures');
      setActiveDocument(DEMO_FREELANCE_STANDARD.document);
      setActiveClauses(DEMO_FREELANCE_STANDARD.clauses);
      setDemoQAMap(DEMO_QA_MAP);
      setCurrentView('results');
      return;
    }
    if (docId === 'demo_freelance_aggressive') {
      const { DEMO_FREELANCE_AGGRESSIVE, DEMO_QA_MAP } = await import('./data/demoFixtures');
      setActiveDocument(DEMO_FREELANCE_AGGRESSIVE.document);
      setActiveClauses(DEMO_FREELANCE_AGGRESSIVE.clauses);
      setDemoQAMap(DEMO_QA_MAP);
      setCurrentView('results');
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
        setCurrentView('results');
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
        setCurrentView('results');
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
        hasActiveDocument={Boolean(activeDocument)}
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

          {currentView === 'results' && (
            <ResultsPage
              document={activeDocument}
              clauses={activeClauses}
              demoQAMap={demoQAMap}
              onSwitchDocument={handleSelectDocument}
              onNavigateUpload={() => setCurrentView('upload')}
            />
          )}

          {currentView === 'how-it-works' && (
            <HowItWorksPage
              onOpenUpload={() => setCurrentView('upload')}
              onStartDemo={handleLaunchDemo}
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

