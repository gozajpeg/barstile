import React, { useState } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { Comparison } from './components/Comparison.jsx';
import { CapabilitiesCarousel } from './components/CapabilitiesCarousel.jsx';
import { VersionDrop } from './components/VersionDrop.jsx';
import { FAQ } from './components/FAQ.jsx';
import { Action } from './components/Action.jsx';
import { Footer } from './components/Footer.jsx';
import { DocsPage } from './pages/DocsPage.jsx';
import { ChangelogPage } from './pages/ChangelogPage.jsx';
import { PrivacyPage } from './pages/PrivacyPage.jsx';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'docs' | 'changelog' | 'privacy'

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#ECEFF4] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Flush Top Navigation */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1">
        {currentView === 'landing' ? (
          <main>
            <Hero onNavigate={handleNavigate} />
            <Comparison />
            <CapabilitiesCarousel onNavigate={handleNavigate} />
            <VersionDrop onNavigate={handleNavigate} />
            <FAQ />
            <Action onNavigate={handleNavigate} />
          </main>
        ) : currentView === 'docs' ? (
          <div className="pt-14 flex flex-col min-h-screen justify-between">
            <DocsPage onNavigate={handleNavigate} />
            <Footer onNavigate={handleNavigate} />
          </div>
        ) : currentView === 'changelog' ? (
          <div className="pt-14 flex flex-col min-h-screen justify-between">
            <ChangelogPage onNavigate={handleNavigate} />
            <Footer onNavigate={handleNavigate} />
          </div>
        ) : (
          <div className="pt-14 flex flex-col min-h-screen justify-between">
            <PrivacyPage onNavigate={handleNavigate} />
            <Footer onNavigate={handleNavigate} />
          </div>
        )}
      </div>
    </div>
  );
}
