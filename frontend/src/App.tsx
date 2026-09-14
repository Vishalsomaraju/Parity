import React, { useState } from 'react';
import { Document, Clause } from '@parity/shared';
import { AppHeader } from './components/layout/AppHeader';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { LandingPage } from './pages/LandingPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ComparePage } from './pages/ComparePage';
import { UploadPage } from './pages/UploadPage';
import {
  DEMO_FREELANCE_STANDARD,
  DEMO_FREELANCE_AGGRESSIVE,
  DEMO_QA_MAP,
} from './data/demoFixtures';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'workspace' | 'compare' | 'upload'>('landing');
  const [activeDocument, setActiveDocument] = useState<Document>(DEMO_FREELANCE_STANDARD.document);
  const [activeClauses, setActiveClauses] = useState<Clause[]>(DEMO_FREELANCE_STANDARD.clauses);

  const handleLaunchDemo = () => {
    setActiveDocument(DEMO_FREELANCE_STANDARD.document);
    setActiveClauses(DEMO_FREELANCE_STANDARD.clauses);
    setCurrentView('workspace');
  };

  const handleSwitchDocument = async (docId: string) => {
    if (docId === 'demo_freelance_standard') {
      setActiveDocument(DEMO_FREELANCE_STANDARD.document);
      setActiveClauses(DEMO_FREELANCE_STANDARD.clauses);
      return;
    }
    if (docId === 'demo_freelance_aggressive') {
      setActiveDocument(DEMO_FREELANCE_AGGRESSIVE.document);
      setActiveClauses(DEMO_FREELANCE_AGGRESSIVE.clauses);
      return;
    }

    // Attempt to load from API if uploaded document
    try {
      const [docRes, clausesRes] = await Promise.all([
        fetch(`/api/documents/${docId}`),
        fetch(`/api/documents/${docId}/clauses`),
      ]);
      if (docRes.ok && clausesRes.ok) {
        const docData = await docRes.json();
        const clausesData = await clausesRes.json();
        setActiveDocument(docData);
        setActiveClauses(clausesData);
      }
    } catch {
      // Keep active
    }
  };

  const handleDocumentProcessed = async (doc: Document) => {
    try {
      const clausesRes = await fetch(`/api/documents/${doc.id}/clauses`);
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
    <div className="app-shell">
      <DisclaimerBanner />
      <AppHeader
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onLaunchDemo={handleLaunchDemo}
      />

      {currentView === 'landing' && (
        <LandingPage
          onStartDemo={handleLaunchDemo}
          onOpenUpload={() => setCurrentView('upload')}
          onOpenCompare={() => setCurrentView('compare')}
        />
      )}

      {currentView === 'workspace' && (
        <WorkspacePage
          document={activeDocument}
          clauses={activeClauses}
          demoQAMap={DEMO_QA_MAP}
          onSwitchDocument={handleSwitchDocument}
        />
      )}

      {currentView === 'compare' && <ComparePage />}

      {currentView === 'upload' && (
        <UploadPage
          onDocumentProcessed={handleDocumentProcessed}
          onLoadSample={(key) => {
            handleSwitchDocument(key);
            setCurrentView('workspace');
          }}
        />
      )}
    </div>
  );
};

export default App;
