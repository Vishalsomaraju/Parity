import React, { useState } from 'react';
import { Document, Clause } from '@parity/shared';
import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { UploadPage } from './pages/UploadPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ComparePage } from './pages/ComparePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LegalLicensingPage } from './pages/LegalLicensingPage';
import {
  DEMO_FREELANCE_STANDARD,
  DEMO_FREELANCE_AGGRESSIVE,
  DEMO_QA_MAP,
} from './data/demoFixtures';
import { apiUrl } from './config';

export type AppView = 'upload' | 'workspace' | 'compare' | 'how-it-works' | 'legal';

export const App: React.FC = () => {
  // Root view is directly the Upload Document interface
  const [currentView, setCurrentView] = useState<AppView>('upload');
  const [activeDocument, setActiveDocument] = useState<Document>(DEMO_FREELANCE_STANDARD.document);
  const [activeClauses, setActiveClauses] = useState<Clause[]>(DEMO_FREELANCE_STANDARD.clauses);

  const handleLaunchDemo = () => {
    setActiveDocument(DEMO_FREELANCE_STANDARD.document);
    setActiveClauses(DEMO_FREELANCE_STANDARD.clauses);
    setCurrentView('workspace');
  };

  const handleSelectDocument = async (docId: string) => {
    if (docId === 'demo_freelance_standard') {
      setActiveDocument(DEMO_FREELANCE_STANDARD.document);
      setActiveClauses(DEMO_FREELANCE_STANDARD.clauses);
      setCurrentView('workspace');
      return;
    }
    if (docId === 'demo_freelance_aggressive') {
      setActiveDocument(DEMO_FREELANCE_AGGRESSIVE.document);
      setActiveClauses(DEMO_FREELANCE_AGGRESSIVE.clauses);
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
        {currentView === 'upload' && (
          <UploadPage
            onDocumentProcessed={handleDocumentProcessed}
            onLoadSample={(key) => handleSelectDocument(key)}
          />
        )}

        {currentView === 'workspace' && (
          <WorkspacePage
            document={activeDocument}
            clauses={activeClauses}
            demoQAMap={DEMO_QA_MAP}
            onSwitchDocument={handleSelectDocument}
            onNavigateUpload={() => setCurrentView('upload')}
          />
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
      </div>

      <AppFooter
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />
    </div>
  );
};

export default App;
