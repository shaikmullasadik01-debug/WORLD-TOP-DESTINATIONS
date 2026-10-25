/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, lazy, Suspense } from 'react';
import { EventProvider, useEventContext } from './context/EventContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DestinationExplorer } from './components/DestinationExplorer';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Destination } from './types';

// Lazy-load secondary views and modals for optimal initial bundle performance
const DestinationModal = lazy(() =>
  import('./components/DestinationModal').then((m) => ({ default: m.DestinationModal }))
);
const AIPlannerWizard = lazy(() =>
  import('./components/AIPlannerWizard').then((m) => ({ default: m.AIPlannerWizard }))
);
const EventWorkspace = lazy(() =>
  import('./components/EventWorkspace').then((m) => ({ default: m.EventWorkspace }))
);
const ThemeStudio = lazy(() =>
  import('./components/ThemeStudio').then((m) => ({ default: m.ThemeStudio }))
);
const BudgetManager = lazy(() =>
  import('./components/BudgetManager').then((m) => ({ default: m.BudgetManager }))
);
const VendorManager = lazy(() =>
  import('./components/VendorManager').then((m) => ({ default: m.VendorManager }))
);

const TabLoadingFallback: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center space-y-4" role="status" aria-label="Loading section">
    <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
    <span className="text-xs font-medium text-slate-500">Loading workspace module...</span>
  </div>
);

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedDestinationModal,
    setSelectedDestinationModal,
  } = useEventContext();

  const [preselectedDestination, setPreselectedDestination] = useState<Destination | null>(null);
  const [explorerCategoryFilter, setExplorerCategoryFilter] = useState<string>('All');

  const handlePlanHere = (destination: Destination) => {
    setPreselectedDestination(destination);
    setActiveTab('ai-planner');
  };

  const handleHeroCategoryFilter = (category: string) => {
    setExplorerCategoryFilter(category);
    setActiveTab('destinations');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Accessible Skip Link for Keyboard / Screen Reader Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-amber-400 focus:text-slate-950 focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-hidden focus:ring-2 focus:ring-amber-600 transition-all text-xs"
      >
        Skip to main content
      </a>

      {/* Top Bar Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-hidden">
        {activeTab === 'destinations' && (
          <div>
            <HeroSection onFilterCategory={handleHeroCategoryFilter} />
            <DestinationExplorer
              onPlanHere={handlePlanHere}
              onOpenDetails={(dest) => setSelectedDestinationModal(dest)}
              initialCategory={explorerCategoryFilter}
            />
          </div>
        )}

        <Suspense fallback={<TabLoadingFallback />}>
          {activeTab === 'ai-planner' && (
            <AIPlannerWizard
              initialDestination={preselectedDestination}
              onPlanCreated={() => setActiveTab('events')}
            />
          )}

          {activeTab === 'events' && <EventWorkspace />}

          {activeTab === 'theme-studio' && <ThemeStudio />}

          {activeTab === 'budget' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="pb-6 border-b border-slate-200 mb-8 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 block mb-1">
                  Financial Control & Ledger
                </span>
                <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  Budget Management
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Real integer-safe minor unit accounting. Track estimates vs confirmed vendor quotations.
                </p>
              </div>
              <BudgetManager />
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="pb-6 border-b border-slate-200 mb-8 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 block mb-1">
                  Contract Management
                </span>
                <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  Verified Vendor Directory
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Track deliverables, deposit schedules, and verified suppliers across all major categories.
                </p>
              </div>
              <VendorManager />
            </div>
          )}
        </Suspense>
      </main>

      {/* Global Destination Detail Modal (Lazy loaded) */}
      <Suspense fallback={null}>
        {selectedDestinationModal && (
          <DestinationModal
            destination={selectedDestinationModal}
            onClose={() => setSelectedDestinationModal(null)}
            onPlanEvent={handlePlanHere}
          />
        )}
      </Suspense>

      {/* Quiet Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <EventProvider>
        <MainAppContent />
      </EventProvider>
    </ErrorBoundary>
  );
}
