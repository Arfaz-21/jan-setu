import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './context/LanguageContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { SchemeExplorer } from './pages/SchemeExplorer';
import { DocumentChecker } from './pages/DocumentChecker';
import { KannadaVoiceAssistant } from './pages/KannadaVoiceAssistant';
import { SakalaTracker } from './pages/SakalaTracker';
import { AppealDraftGenerator } from './pages/AppealDraftGenerator';
import { ProfilePrivacySettings } from './pages/ProfilePrivacySettings';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="dashboard" element={<CitizenDashboard />} />
              <Route path="schemes" element={<SchemeExplorer />} />
              <Route path="documents" element={<DocumentChecker />} />
              <Route path="voice" element={<KannadaVoiceAssistant />} />
              <Route path="sakala" element={<SakalaTracker />} />
              <Route path="appeals" element={<AppealDraftGenerator />} />
              <Route path="profile" element={<ProfilePrivacySettings />} />
              <Route path="*" element={<LandingPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
