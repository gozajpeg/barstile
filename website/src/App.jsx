import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { Comparison } from './components/Comparison.jsx';
import { CapabilitiesCarousel } from './components/CapabilitiesCarousel.jsx';
import { VersionDrop } from './components/VersionDrop.jsx';
import { FAQ } from './components/FAQ.jsx';
import { Action } from './components/Action.jsx';
import { Footer } from './components/Footer.jsx';

const DocsPage = lazy(() => import('./pages/DocsPage.jsx').then(m => ({ default: m.DocsPage })));
const ChangelogPage = lazy(() => import('./pages/ChangelogPage.jsx').then(m => ({ default: m.ChangelogPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx').then(m => ({ default: m.PrivacyPage })));

function getPathView() {
  if (typeof window === 'undefined') return 'landing';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/docs') return 'docs';
  if (path === '/changelog') return 'changelog';
  if (path === '/privacy') return 'privacy';
  return 'landing';
}

function viewToPath(view) {
  if (view === 'docs') return '/docs';
  if (view === 'changelog') return '/changelog';
  if (view === 'privacy') return '/privacy';
  return '/';
}

const VIEW_TITLES = {
  landing: 'Barstile | Self-hosted, non-interactive bot protection',
  docs: 'Barstile | Documentation',
  changelog: 'Barstile | Changelog',
  privacy: 'Barstile | Privacy Policy'
};

export default function App() {
  const [currentView, setCurrentView] = useState(getPathView);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      setCurrentView(getPathView());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Update document title and canonical URL whenever view changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = VIEW_TITLES[currentView] || VIEW_TITLES.landing;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', `https://barstile.pages.dev${viewToPath(currentView)}`);
      }
    }
  }, [currentView]);

  const handleNavigate = (view) => {
    const targetPath = viewToPath(view);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#ECEFF4] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Flush Top Navigation */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1">
        <Suspense fallback={null}>
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
        </Suspense>
      </div>
    </div>
  );
}
